import { useCamera } from '@ionic/react-hooks/camera';
import { CameraPhoto, CameraResultType, CameraSource, FilesystemDirectory } from '@capacitor/core';
import { useEffect, useState } from 'react';
import { base64FromPath, useFilesystem } from '@ionic/react-hooks/filesystem';
import { useStorage } from '@ionic/react-hooks/storage';

export interface Photo {
  filepath: string;
  webviewPath?: string;
}

export function usePhotoGallery() {
  const { getPhoto } = useCamera();
  const { get, set, remove } = useStorage();

  const takePhoto = async (id: string) => {
    const cameraPhoto = await getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });
    const fileName = id + '.jpeg';
    const savedFileImage = await savePicture(cameraPhoto, fileName);
    set(id!!, JSON.stringify(savedFileImage));
    return savedFileImage;
  };

  const { readFile, writeFile, deleteFile } = useFilesystem();

  const savePicture = async (photo: CameraPhoto, fileName: string): Promise<Photo> => {
    const base64Data = await base64FromPath(photo.webPath!);
    await writeFile({
      path: fileName,
      data: base64Data,
      directory: FilesystemDirectory.Data
    });

    return {
      filepath: fileName,
      webviewPath: photo.webPath
    };
  };

  const loadPhoto = async (id?: string) => {
      const photoString = await get(id!!);
      const photo = (photoString ? JSON.parse(photoString) : undefined) as Photo;
      if(photo == undefined){
        return undefined;
      }
      const file = await readFile({
        path: photo.filepath,
        directory: FilesystemDirectory.Data
      });
      photo.webviewPath = `data:image/jpeg;base64,${file.data}`;
      return photo;
    };

  const deletePhoto = async (photo: Photo, id?: string) => {
      if(photo == undefined || id == undefined){
        return;
      }
      remove(id!);
      const filename = photo.filepath.substr(photo.filepath.lastIndexOf('/') + 1);
      await deleteFile({
        path: filename,
        directory: FilesystemDirectory.Data
      });
    };

  return {
    takePhoto,
    loadPhoto,
    deletePhoto
  };
}
