import { useRef, useState } from "react";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Type your question...",
}) {
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [imageError, setImageError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    setImageError(null);

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError("Upload a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setImageError("Image must be 5MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImage({
        dataUrl: reader.result,
        name: file.name,
        type: file.type,
        size: file.size,
      });
    };
    reader.onerror = () => {
      setImageError("Could not read that image. Please try another photo.");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if ((!input.trim() && !image) || disabled) return;
    onSend(input, image);
    setInput("");
    setImage(null);
    setImageError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {image && (
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-2">
          <img
            src={image.dataUrl}
            alt="Selected animal"
            className="h-14 w-14 rounded-md object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">
              {image.name}
            </p>
            <p className="text-xs text-gray-500">Photo ready for AI review</p>
          </div>
          <button
            type="button"
            onClick={() => setImage(null)}
            className="rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-white"
          >
            Remove
          </button>
        </div>
      )}

      {imageError && <p className="text-xs text-red-700">{imageError}</p>}

      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
          disabled={disabled}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="btn-secondary px-3 disabled:cursor-not-allowed disabled:opacity-50"
          title="Upload animal photo"
        >
          Photo
        </button>
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          disabled={disabled}
          placeholder={
            image ? "Add details like where/how you found it..." : placeholder
          }
          className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
        />
        <button
          type="submit"
          disabled={disabled || (!input.trim() && !image)}
          className="btn-primary min-w-[88px] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {disabled ? "Sending..." : "Send"}
        </button>
      </div>
    </form>
  );
}
