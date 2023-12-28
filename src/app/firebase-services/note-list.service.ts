import { Injectable, inject } from '@angular/core';
import { Note } from '../interfaces/note.interface'
import { Firestore, collection, doc, collectionData, onSnapshot, addDoc, updateDoc, deleteDoc, orderBy, limit, query, where,} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NoteListService {

  // item$;
  // item;

  trashNotes: Note[] = [];
  normalNotes: Note[] = [];
  normalMarkedNotes: Note[] = [];


  unsubNotes;
  unsubTrash;
  unsubMarkedNotes;
  //unsubSingle;

  firestore: Firestore = inject(Firestore);

  constructor() {

    this.unsubNotes = this.subNotesList();

    this.unsubTrash = this.subTrashList();

    this.unsubMarkedNotes = this.subMarkedNotesList();

    //this.unsubSingle = onSnapshot(this.getSingleDocRef("notes", "awededwq"), (element) => {});
    //this.unsubSingle;

    // this.item$ = collectionData(this.getNotesRef());
    // this.item = this.item$.subscribe((list) => {
    //   list.forEach(element => {
    //     console.log(element)
    //   });
    // });

  }
  // const itemCollection = collection(this.firestore, 'items');

  async addNote(item: Note, colId: "notes" | "trash"){

    let reff; 
    if (colId == "notes") {
      reff = this.getNotesRef();
    } else { 
      reff = this.getTrashRef();
    }

    await addDoc(reff, item).catch(
      (err) => {console.error(err)}
    ).then(
      (docRef) => {console.log("Document written with ID: ", docRef?.id);}
    )
  }

  async updateNote(note: Note){
    if (note.id) {
      let docRef = this.getSingleDocRef(this.getColID(note), note.id);
      await updateDoc(docRef, this.getCleanJS(note)).catch(
        (err) => {console.error(err)}
      )
    }
  }

  getCleanJS(note:Note){
    return {
    type: note.type,
    title: note.title,
    content: note.content,
    marked: note.marked,
  }
  }

  getColID(note: Note){
    if (note.type == 'note') {
      return 'notes'
    }else{
      return 'trash'
    }
  }

  async deleteNote(colId: string, docId: string){
    await deleteDoc(this.getSingleDocRef(colId, docId)).catch(
      (err) => {console.error(err)}
    )
  }

  ngOnDestroy() {
    //this.item.unsubscribe();
    this.unsubNotes();
    this.unsubTrash();
    this.unsubMarkedNotes();
  }

  subNotesList() {
    // Um Subcollections anzuzeigen kann man die colId  wie eine URL schreiben:
    //let extraReff =  collection(this.firestore, "notes/9D8pBItYgCZna6gtgRGg/notesExtra")
    const q = query(this.getNotesRef(), orderBy("title"), limit(100));

    return onSnapshot(q, (list) => {
      this.normalNotes = [];
      list.forEach(element => {
        this.normalNotes.push(this.setNoteObject(element.data(), element.id));
      });
      list.docChanges().forEach((change) => {
        if (change.type === "added") {
            console.log("New note: ", change.doc.data());
        }
        if (change.type === "modified") {
            console.log("Modified note: ", change.doc.data());
        }
        if (change.type === "removed") {
            console.log("Removed note: ", change.doc.data());
        }
      });
    });
    
  }

  subMarkedNotesList() {
    const q = query(this.getNotesRef(), where("marked", "==", true), limit(100));

    return onSnapshot(q, (list) => {
      this.normalMarkedNotes = [];
      list.forEach(element => {
        this.normalMarkedNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  subTrashList() {
    return onSnapshot(this.getTrashRef(), (list) => {
      this.trashNotes = [];
      list.forEach(element => {
        this.trashNotes.push(this.setNoteObject(element.data(), element.id))
      });
    });

  }

  setNoteObject(obj: any, id: string): Note {
    return {
      id: id,
      type: obj.type || "note",
      title: obj.title || "title",
      content: obj.content || "",
      marked: obj.marked || false,
    }
  }

  getNotesRef() {
    return collection(this.firestore, 'notes')
  }

  getTrashRef() {
    return collection(this.firestore, 'trash')
  }

  getSingleDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId)
  }
}
