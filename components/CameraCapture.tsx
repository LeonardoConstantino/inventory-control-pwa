import React, { useRef, useState, useEffect, useCallback } from 'react';

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  initialImage?: string | null;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, initialImage }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(initialImage || null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // Efeito para conectar o stream ao elemento de vídeo quando o estado 'stream' mudar.
  // Isso garante que o videoRef.current exista antes de tentarmos usá-lo.
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const startCamera = useCallback(async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setCapturedImage(null);
    setIsVideoReady(false);
    setError(null);
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(newStream); // Apenas atualiza o estado. O useEffect cuidará de conectar ao elemento de vídeo.
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Não foi possível acessar a câmera. Verifique as permissões.");
      setStream(null);
    }
  }, [stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsVideoReady(false);
  }, [stream]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && isVideoReady) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        if (dataUrl && dataUrl.length > 'data:image/jpeg;base64,'.length) {
            setCapturedImage(dataUrl);
            onCapture(dataUrl);
            stopCamera();
        } else {
            console.error("Failed to capture image. Canvas might be blank.");
            setError("Falha ao capturar imagem. Tente novamente.");
        }
      }
    }
  };

  // Efeito de limpeza para parar a câmera quando o componente for desmontado.
  useEffect(() => {
    return () => {
      // Usando uma função anônima para chamar a versão mais recente de stopCamera no momento da limpeza
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center w-full space-y-4">
      <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center relative">
        {error && <p className="text-red-500 text-center px-4 z-10">{error}</p>}
        {capturedImage && !stream && (
          <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
        )}
        {stream && (
            <>
                <video ref={videoRef} autoPlay playsInline onLoadedData={() => setIsVideoReady(true)} className="w-full h-full object-cover" />
                {!isVideoReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <p className="text-white">Iniciando câmera...</p>
                    </div>
                )}
            </>
        )}
        {!stream && !capturedImage && (
            <div className="text-gray-500 dark:text-gray-400 flex flex-col items-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                 <span className="mt-2">Foto do Item</span>
            </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
      {stream ? (
        <div className="flex space-x-4">
          <button type="button" onClick={handleCapture} className="bg-primary text-white px-6 py-2 rounded-lg shadow hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={!isVideoReady}>
            Capturar Foto
          </button>
          <button type="button" onClick={stopCamera} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors">
            Cancelar
          </button>
        </div>
      ) : (
        <button type="button" onClick={startCamera} className="bg-accent text-white px-6 py-2 rounded-lg shadow hover:bg-secondary transition-colors">
          {capturedImage ? 'Tirar Outra Foto' : 'Tirar Foto'}
        </button>
      )}
    </div>
  );
};

export default CameraCapture;