// src/services/reviewPhotoService.js
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../firebase";

const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 0.8;

// Resize and compress image on client before upload
const processImage = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to process image"));
          }
        },
        "image/jpeg",
        JPEG_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
};

// Upload 1-3 review photos to Firebase Storage
export const uploadReviewPhotos = async (userId, reviewId, files) => {
  const urls = [];

  for (const file of files.slice(0, 3)) {
    const processed = await processImage(file);
    const timestamp = Date.now();
    const filename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const storagePath = `review-photos/${userId}/${reviewId}/${timestamp}_${filename}`;
    const storageRef = ref(storage, storagePath);

    await uploadBytes(storageRef, processed, {
      contentType: "image/jpeg",
    });

    const downloadUrl = await getDownloadURL(storageRef);
    urls.push(downloadUrl);
  }

  return urls;
};

// Delete review photos from Storage
export const deleteReviewPhotos = async (photoUrls) => {
  for (const url of photoUrls) {
    try {
      // Extract storage path from download URL
      const storageRef = ref(storage, url);
      await deleteObject(storageRef);
    } catch (error) {
      // Photo may already be deleted — continue with others
      console.error("Error deleting photo:", error);
    }
  }
};
