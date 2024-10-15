import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';

interface CustomerPhoto {
  id: string;
  photo: Blob;  // Blob type to store images
}

@Injectable({
  providedIn: 'root',
})
export class IndexedDbService {
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = this.initDB();
  }

  // Initialize IndexedDB
  private async initDB() {
    return openDB('CustomerDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('photos')) {
          db.createObjectStore('photos', { keyPath: 'id' });
        }
      },
    });
  }

  // Add photo with customer ID
  async addPhoto(id: string, photo: Blob): Promise<void> {
    console.log('Id',id,'File stored',photo)
    const db = await this.dbPromise;
    await db.put('photos', { id, photo });
  }

  // Retrieve photo by customer ID
  async getPhoto(id: string): Promise<CustomerPhoto | undefined> {
    const db = await this.dbPromise;
    console.log(db)
    return db.get('photos', id);

  }
  async addOrUpdatePhoto(id: string, photo: Blob): Promise<void> {
    console.log('Id:', id, 'File stored:', photo);
    const db = await this.dbPromise;
    await db.put('photos', { id, photo }); // This will update if the ID exists
  }

  // Get all customer photos
  async getAllPhotos(): Promise<CustomerPhoto[]> {
    const db = await this.dbPromise;
    return db.getAll('photos');
  }

  // Delete photo by customer ID
  async deletePhoto(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('photos', id);
  }
}
