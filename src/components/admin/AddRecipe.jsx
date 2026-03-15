import { useState } from "react";
import { recipeService } from "../../services/api";

function AddRecipe() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!title.trim() || !description.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await recipeService.addRecipe({
        title,
        description
      });

      if (result.success || result._id) {
        setSuccess("Recipe added successfully!");
        // Reset form
        setTitle("");
        setDescription("");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to add recipe");
      }
    } catch (err) {
      setError(err.message || "Error adding recipe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
      {success && <div style={{ color: "green", marginBottom: "10px" }}>{success}</div>}

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={loading}
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={loading}
        rows="4"
      />

      <button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Recipe"}
      </button>
    </form>
  );
}

export default AddRecipe;