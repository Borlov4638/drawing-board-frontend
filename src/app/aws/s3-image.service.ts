// Polyfill for global object
(window as any).global = window;

import { Injectable } from '@angular/core';
import * as AWS from 'aws-sdk';

@Injectable()
export class ImageS3Service {
  private s3 = new AWS.S3({
    endpoint: 'https://s3.timeweb.cloud', // Укажите ваш endpoint
    accessKeyId: 'CX6M0GOYTD5SITTC5EOR', // Укажите ваш access key
    secretAccessKey: 'wGNYHoMSGNPStVzMKS3BFDP682jbEBdJ8A4VVblM', // Укажите ваш secret key
  });

  // Метод для получения объекта из S3 по имени
  async getObject(
    bucketName: string,
    objectKey: string
  ): Promise<AWS.S3.GetObjectOutput> {
    const params = {
      Bucket: bucketName,
      Key: objectKey,
    };

    return this.s3
      .getObject(params)
      .promise()
      .catch((error) => {
        console.log(error);
        throw new Error('s3 fetch data error', error);
      });
  }

  async getBucketObjects(bucket: string) {
    return this.s3
      .listObjects({
        Bucket: bucket,
      })
      .promise();
  }

  getSignedUrl(key: string): string {
    const params = {
      Bucket: '48571c60-draw-app',
      Key: key,
      Expires: 60, // URL expiration time in seconds
    };
    return this.s3.getSignedUrl('getObject', params);
  }
}
