import MuiModal from './MuiModal';
import CardWithTitle from '../CardWithTitle';
import MuiInput from './MuiInput';
import CancelButton from './CancelButton';
import CreateButton from './CreateButton';
import { useRef, useState } from 'react';

export default function MuiFileUploadModal({ open, onClose, onUpload, loading = false, title = 'Cargar archivo', accept = '*' }) {
  const fileInputRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0] || null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedFile && onUpload) {
      onUpload(selectedFile);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  return (
    <MuiModal open={open} onClose={handleCancel} maxWidth="max-w-md">
      <CardWithTitle title={title} loading={loading}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-2">
          <MuiInput
            label="Selecciona un archivo"
            name="file"
            type="file"
            accept={accept}
            ref={fileInputRef}
            onChange={handleFileChange}
            className="w-full"
          />
          {selectedFile && (
            <div className="text-sm text-blue-700 font-medium">Archivo seleccionado: {selectedFile.name}</div>
          )}
          <div className="flex justify-end gap-2 mt-2">
            <CreateButton type="submit" title="Subir" disabled={!selectedFile || loading} />
            <CancelButton onClick={handleCancel} />
          </div>
        </form>
      </CardWithTitle>
    </MuiModal>
  );
}
