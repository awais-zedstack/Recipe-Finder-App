import express from "express"
import { ENV } from "./config/env.js"
import { db } from "./config/db.js"
import { favouritesTable } from "./db/Schema.js"
import { eq, and } from "drizzle-orm";
const app = express()
const PORT = ENV.PORT || 3000

app.use(express.json())
app.get("/api/health",(req,res)=>{
  res.status(200).json({success : true})
})

app.post("/api/favorites",async (req,res)=>{
  try {
    const {userId,recipeId, title,image,cookTime,servings} = req.body
if (!userId) {
    return res.status(400).json({message : "User is required"})
  }
  const newFavouriteTable = await db.insert(favouritesTable).values({
    userId,
    recipeId,
    title,
    image,
    cookTime,
    servings
  })
  .returning()
  res.status(201).json(newFavouriteTable[0])
  } catch (error) {
    console.error("Error adding favorite:", error)
    res.status(500).json({ success: false, message: "Internal Server Error" })
  }
})

app.get('/api/favourites/:userId',async (req,res) => {
  try {
     const {userId} = req.params;
   const favourites = await  db.select().from(favouritesTable).where(favouritesTable.userId,userId)
   res.status(200).json(favourites)
}
catch (error) {
   console.error("Error fetching favourites:", error)
   res.status(500).json({ success: false, message: "Internal Server Error" })
}
})

app.delete("/api/favourites/:userId/:recipeId", async (req, res) => {
  try {
    const { userId, recipeId } = req.params;

    // DB delete operation
    const deleted = await db
      .delete(favouritesTable)
      .where(
        and(
          eq(favouritesTable.userId, userId),
          eq(favouritesTable.recipeId, recipeId) // <- parseInt only if numeric
        )
      )
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Favourite not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Favourite deleted successfully"
    });
  } catch (error) {
    console.error(" Error deleting favourite:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
});




// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on the port ${PORT}`);
  });
}

// Export for Vercel
export default app;

