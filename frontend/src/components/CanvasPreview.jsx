import { useEffect, useRef } from 'react';

export default function CanvasPreview({ content }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw border
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Draw content preview
    ctx.fillStyle = '#374151';
    ctx.font = '14px Arial';
    ctx.fillText('Content Preview:', 20, 40);

    // Strip HTML and show text preview
    const plainText = content
      .replace(/<[^>]*>/g, '')
      .substring(0, 200)
      .split('\n')
      .slice(0, 15);

    let yPos = 70;
    plainText.forEach((line) => {
      if (yPos < canvas.height - 20) {
        ctx.fillText(line.trim(), 20, yPos);
        yPos += 25;
      }
    });
  }, [content]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Canvas Preview</h2>
        </div>
        <div className="p-6 flex justify-center">
          <canvas
            ref={canvasRef}
            className="border border-gray-300 rounded-lg shadow"
          />
        </div>
      </div>
    </div>
  );
}
