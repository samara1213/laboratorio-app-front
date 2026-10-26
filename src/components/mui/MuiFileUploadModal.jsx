import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Field, Input } from '@/components/ui/field';

// tipos que acepta el backend para los adjuntos de una orden
const DEFAULT_ACCEPT = 'application/pdf,image/png,image/jpeg,image/gif,image/webp,image/bmp';

/**
 * Diálogo para adjuntar un archivo (PDF o imagen; en celular y tablet permite usar la cámara)
 * Props: open, onClose, onUpload(file), loading, title, accept
 */
export default function MuiFileUploadModal({ open, onClose, onUpload, loading = false, title = 'Adjuntar archivo', accept = DEFAULT_ACCEPT }) {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const reset = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedFile && onUpload) onUpload(selectedFile);
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && handleCancel()}>
      <DialogContent
        size="md"
        title={title}
        description="PDF o imagen de máximo 10 MB."
        footer={
          <>
            <Button variant="secondary" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit" form="form-adjunto" disabled={!selectedFile || loading}>
              {loading ? 'Subiendo…' : 'Subir archivo'}
            </Button>
          </>
        }
      >
        <form id="form-adjunto" onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Field label="Archivo">
            {(field) => <Input type="file" accept={accept} ref={fileInputRef} onChange={(e) => setSelectedFile(e.target.files[0] || null)} {...field} />}
          </Field>
          {selectedFile && (
            <p className="text-[15px] text-muted">
              Seleccionado: <span className="font-semibold text-ink">{selectedFile.name}</span>
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
