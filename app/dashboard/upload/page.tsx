import FileUploader from '@/components/FileUploader';
import GooglePickerUploader from '@/components/GooglePickerUploader';
import React from 'react';

function UploadPage() {
  return (
    <div>
      {/* File Uploader Component */}
      <FileUploader />
      <GooglePickerUploader/>
    </div>
  );
}

export default UploadPage;
