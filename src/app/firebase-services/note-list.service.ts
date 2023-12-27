import { Injectable, inject } from '@angular/core';
import { Note } from '../interfaces/note.interface'
import { Firestore, collection, doc, collectionData, onSnapshot } from '@angular/fire/firestore';
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
