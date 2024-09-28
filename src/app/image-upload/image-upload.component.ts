import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.css'],
})
export class ImageUploadComponent {
  selectedFile: File | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] || null;
  }

  onUpload() {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);

    this.http
      .post<{ id: string }>('http://localhost:5024/image/upload', formData)
      .subscribe((response) => {
        const imageId = response.id;
        this.router.navigate(['/draw', imageId]);
      });
  }
}
