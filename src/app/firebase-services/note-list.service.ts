import { Injectable, inject } from '@angular/core';
import { Note } from '../interfaces/note.interface'
import { Firestore, collection, doc, collectionData, onSnapshot, addDoc, updateDoc, deleteDoc,} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NoteListService {

  // item$;
  // item;

  trashNotes: Note[] = [];
  normalNotes: Note[] = [];


  unsubNotes;
  unsubTrash;
  //unsubSingle;

  firestore: Firestore = inject(Firestore);

  constructor() {

    this.unsubNotes = this.subNotesList();

    this.unsubTrash = this.subTrashList();

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

  async addNote(item: Note, colId: 'notes' | 'trash'){

    let reff; 
    if (colId = 'notes') {
      reff = this.getNotesRef()
    } else { 
      reff = this.getTrashRef()
    }

    await addDoc(reff, item).catch(
      (err) => {console.error(err)}
    ).then(
      (docRef) => {console.log("Document written with ID: ", docRef?.id);}
    )
  }

  setColID(colId: 'notes' | 'trash'){
    if (colId = 'notes') {
      let reff = this.getNotesRef()
    } else { 
      let reff = this.getTrashRef()
    }
    
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
    this.unsubNotes;
    this.unsubTrash;
  }

  subNotesList() {
    return onSnapshot(this.getNotesRef(), (list) => {
      this.normalNotes = [];
      list.forEach(element => {
        this.normalNotes.push(this.setNoteObject(element.data(), element.id));
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
