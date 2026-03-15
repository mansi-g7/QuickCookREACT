import { useEffect, useState } from "react";
import { recipeService } from "../services/api";

function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await recipeService.getRecipes();
        
        // Handle both array and object responses
        if (Array.isArray(data)) {
          setRecipes(data);
        } else if (data && typeof data === "object") {
          // If response is an object instead of array
          console.warn("Unexpected response format:", data);
          setRecipes(data.recipes || []);
        } else {
          setRecipes([]);
        }
      } catch (err) {
        setError("Failed to load recipes: " + err.message);
        console.error("Error fetching recipes:", err);
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  if (loading) return <div>Loading recipes...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (recipes.length === 0) return <div>No recipes available</div>;

  return (
    <div>
      {recipes.map((r) => (
        <div key={r._id} style={{ border: "1px solid #ccc", padding: "10px", margin: "10px 0" }}>
          <h3>{r.title}</h3>
          <p>{r.description}</p>
          {r.cookingTime && <p>Cooking Time: {r.cookingTime}</p>}
          {r.difficulty && <p>Difficulty: {r.difficulty}</p>}
        </div>
      ))}
    </div>
  );
}

export default Recipes;