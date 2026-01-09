import { BookImage, Globe, Smile, Video, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../Redux Toolkit/hooks";
import type { RootState } from "../../Redux Toolkit/Store";
import { fetchMe } from "../../Redux Toolkit/slices/userSlice";
import { CREATE_POST_MUTATION, GET_UPLOAD_TARGETS_MUTATION, } from "../../GraphqlOprations/mutations";
import toast from "react-hot-toast";

interface CreatePostProps {
  onPostCreated?: () => void;
}

const CreatePost = ({ onPostCreated }: CreatePostProps) => {
  const [showModal, setShowModal] = useState(false);
  const [postText, setPostText] = useState("");
  const [open, setOpen] = useState(false);
  const [visibility, setVisibility] = useState("Public");
  const dispatch = useAppDispatch();
  const me = useAppSelector((s: RootState) => s.user.user);
  const displayName = me ? `${me.firstName} ${me.surname}` : "User";
  const initials = displayName
    .split(" ")
    .map((p) => p[0]?.toUpperCase() || "")
    .join("")
    .slice(0, 2);

  const options = ["Public", "Private", "Only me"];
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePostSubmit = async () => {
    if (!postText.trim()) return;
    let imageUrl: string | undefined;
    let imageUrls: string[] = [];

    if (files.length) {
      try {
        const requests = files.map((f) => ({
          filename: f.name,
          contentType: f.type || "application/octet-stream",
        }));

        const presignRes = await fetch(import.meta.env.VITE_GRAPHQL_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            query: GET_UPLOAD_TARGETS_MUTATION,
            variables: { requests },
          }),
        });

        const presignJson = await presignRes.json();

        if (presignJson.errors && presignJson.errors.length) {
          throw new Error(
            presignJson.errors[0].message || "Failed to get upload URLs"
          );
        }

        const targets: {
          uploadUrl: string;
          publicUrl: string;
          fields?: { key: string; value: string }[] | null;
        }[] = presignJson.data?.getUploadTargets || [];

        if (targets.length !== files.length) {
          throw new Error("Upload targets mismatch");
        }

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const target = targets[i];

          if (target.fields && target.fields.length > 0) {
            // Use POST method (presigned POST with form fields)
            const formData = new FormData();
            target.fields.forEach(({ key, value }) => {
              formData.append(key, value);
            });
            formData.append("file", file);

            const uploadRes = await fetch(target.uploadUrl, {
              method: "POST",
              body: formData,
            });

            if (!uploadRes.ok) {
              throw new Error(
                `Upload failed: ${uploadRes.statusText} (${uploadRes.status})`
              );
            }
          } else {
            const uploadUrl = new URL(target.uploadUrl);
            const searchParams = uploadUrl.searchParams;

            console.log(
              "Signed URL params:",
              Object.fromEntries(searchParams.entries())
            );

            // Check what headers are signed
            const signedHeaders = searchParams.get("X-Amz-SignedHeaders") || "";
            console.log("Signed headers:", signedHeaders);

            // Build headers exactly as signed
            const headers: HeadersInit = {};

            // If x-amz-acl is in signed headers, add it
            if (signedHeaders.includes("x-amz-acl")) {
              headers["x-amz-acl"] = "public-read";
            }

            // Send Content-Type header ONLY if it is part of the signed headers
            if (signedHeaders.includes("content-type")) {
              headers["Content-Type"] = file.type || "application/octet-stream";
            }

            console.log("Using headers:", headers);

            // Try with minimal headers
            const uploadRes = await fetch(target.uploadUrl, {
              method: "PUT",
              headers,
              body: file,
            });

            if (!uploadRes.ok) {
              const errorText = await uploadRes.text();
              console.error("Upload failed details:", {
                status: uploadRes.status,
                statusText: uploadRes.statusText,
                error: errorText,
                url: target.uploadUrl,
                signedHeaders: signedHeaders,
                headersUsed: headers,
              });
              throw new Error(
                `Upload failed: ${uploadRes.status} ${uploadRes.statusText}`
              );
            }
          }
        }

        imageUrls = targets.map((t) => t.publicUrl);
        imageUrl = imageUrls[0];
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Image upload failed";
        toast.error(message);
        console.error("Upload error:", err);
        return;
      }
    }

    try {
      const res = await fetch(import.meta.env.VITE_GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          query: CREATE_POST_MUTATION,
          variables: {
            input: {
              content: postText,
              imageUrl,
              imageUrls: imageUrls.length > 0 ? imageUrls : null,
            },
          },
        }),
      });

      const json = await res.json();

      if (json.errors && json.errors.length) {
        toast.error(json.errors[0].message || "Create post failed");
        return;
      }

      setPostText("");
      setFiles([]);
      setShowModal(false);

      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error) {
      toast.error("Failed to create post");
      console.error("Post creation error:", error);
    }
  };
  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex items-center gap-2  w-full">
        <div className="flex items-center space-x-3 w-full">
          <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
            {initials}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex-1 text-left w-full cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full px-4 py-3 transition-colors"
          >
            <span className="font-medium">
              {"What's on your mind, " + (me?.firstName || "User") + "?"}
            </span>
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className={` text-red-500`}>
                <Video className="w-10 h-10 cursor-pointer" />
              </span>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className={`text-xl text-green-500`}>
                <BookImage className="w-8 h-8 cursor-pointer" />
              </span>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className={`text-xl text-yellow-500`}>
                <Smile className="w-8 h-8 cursor-pointer" />
              </span>
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm  flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-xl">
            <div className="p-4 border-b border-gray-300 flex  items-center w-full">
              <h2 className="text-xl font-bold text-gray-800 w-full text-center">
                Create Post
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full"
              >
                &times;
              </button>
            </div>

            <div className="p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {initials}
                </div>
                <div className="relative inline-block">
                  <p className="font-semibold">{displayName}</p>

                  <button
                    onClick={() => setOpen(!open)}
                    className="flex items-center cursor-pointer space-x-1 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-sm mt-1"
                  >
                    <span className="text-gray-600">
                      <Globe className="w-4 h-4" />
                    </span>
                    <span className="font-medium text-gray-700">
                      {visibility}
                    </span>
                    <span className="text-gray-500">▼</span>
                  </button>

                  {open && (
                    <div className="absolute mt-2 w-32 bg-white border rounded-lg  shadow-md z-10 ">
                      {options.map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setVisibility(option);
                            setOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder={
                  "What's on your mind, " + (me?.firstName || "User") + "?"
                }
                className="w-full h-10 p-3 text-lg border-0 focus:outline-none resize-none placeholder-gray-500"
                autoFocus
              />
              <div className="mt-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setFiles(Array.from(e.target.files || []))}
                  className="block w-full text-sm text-gray-700"
                />
                {files.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {files.map((f, idx) => (
                      <div
                        key={idx}
                        className="relative w-full aspect-square rounded-md overflow-hidden border border-gray-200 group"
                      >
                        <img
                          src={URL.createObjectURL(f)}
                          alt={f.name}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() =>
                            setFiles(files.filter((_, i) => i !== idx))
                          }
                          className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-300">
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className={` text-red-500`}>
                      <Video className="w-10 h-10" />
                    </span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className={`text-xl text-green-500`}>
                      <BookImage className="w-8 h-8" />
                    </span>
                  </button>
                  <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className={`text-xl text-yellow-500`}>
                      <Smile className="w-8 h-8" />
                    </span>
                  </button>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePostSubmit}
                    disabled={!postText.trim()}
                    className={`px-6 py-2 rounded-md font-bold ${
                      postText.trim()
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreatePost;
