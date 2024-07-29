import Poster from "../models/poster";

async function findPoster(id: string) {
  try {
    console.log(id);
    const poster = await Poster.findById(id);

    if (!poster) {
      return null;
    }
    return poster;
  } catch (error) {
    throw error;
  }
}

const PosterService = {
  findPoster,
};
export default PosterService;
