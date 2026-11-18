import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { extname } from 'path';

@Injectable()
export class S3Service {
  private readonly client = new S3Client({
    region: 'ru-central1',
    endpoint: 'https://storage.yandexcloud.net',
    credentials: {
      accessKeyId: process.env.S3_KEY_ID ?? '',
      secretAccessKey: process.env.S3_KEY_SECRET ?? '',
    },
  });

  private readonly bucket = process.env.S3_BUCKET ?? '';

  async upload(file: Express.Multer.File, folder = 'products'): Promise<string> {
    const ext = extname(file.originalname);
    const key = `${folder}/${randomUUID()}${ext}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return `https://${this.bucket}.storage.yandexcloud.net/${key}`;
  }

  async delete(url: string): Promise<void> {
    const key = url.split(`${this.bucket}.storage.yandexcloud.net/`)[1];
    if (!key) return;

    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }
}
