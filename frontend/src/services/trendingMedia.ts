import { fetchMovies } from './movies';
import { fetchSeries } from './series';
import type { Datum as MovieDatum } from '@/types/movie';
import type { Datum as SerieDatum } from '@/types/serie';

export interface TrendingItem {
  id: number;
  name: string;
  slug: string;
  image: string;
  score: number;
  year: string;
  type: 'movie' | 'series';
}

export async function getTrendingContent(limit: number = 15): Promise<TrendingItem[]> {
  try {
    // Usar páginas aleatorias para más variedad y evitar siempre el mismo contenido
    const getRandomPages = () => {
      const pages = [];
      for (let i = 0; i < 4; i++) {
        pages.push(Math.floor(Math.random() * 8) + 1); // Páginas 1-8
      }
      return [...new Set(pages)]; // Eliminar duplicados
    };
    
    const pagesToFetch = getRandomPages();
    
    const [moviesPromises, seriesPromises] = await Promise.all([
      Promise.all(pagesToFetch.map(page => fetchMovies(page))),
      Promise.all(pagesToFetch.map(page => fetchSeries(page)))
    ]);

    // Procesar películas
    const allMovies: MovieDatum[] = [];
    moviesPromises.forEach(response => {
      allMovies.push(...response.data);
    });

    // Procesar series
    const allSeries: SerieDatum[] = [];
    seriesPromises.forEach(response => {
      allSeries.push(...response.data);
    });

    // Convertir a formato unificado con filtros más dinámicos
    const trendingMovies: TrendingItem[] = allMovies
      .filter(movie => movie.score >= 6.8) // Score un poco más permisivo para más variedad
      .map(movie => ({
        id: movie.id,
        name: movie.name,
        slug: movie.slug,
        image: movie.image,
        score: movie.score,
        year: movie.year,
        type: 'movie' as const
      }));

    const trendingSeries: TrendingItem[] = allSeries
      .filter(serie => serie.score >= 6.8) // Score un poco más permisivo para más variedad
      .map(serie => ({
        id: serie.id,
        name: serie.name,
        slug: serie.slug,
        image: serie.image,
        score: serie.score,
        year: serie.year,
        type: 'series' as const
      }));

    // Combinar y crear un algoritmo de trending más sofisticado
    const allTrending = [...trendingMovies, ...trendingSeries];
    
    // Remover duplicados por ID y tipo
    const uniqueTrending = allTrending.filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id && t.type === item.type)
    );

    // Algoritmo de trending que considera score, año y un factor aleatorio para variedad
    const sortedTrending = uniqueTrending.sort((a, b) => {
      const currentYear = new Date().getFullYear();
      
      // Factor de recency (más peso a contenido reciente)
      const recencyA = Math.max(0, currentYear - parseInt(a.year)) / 10;
      const recencyB = Math.max(0, currentYear - parseInt(b.year)) / 10;
      
      // Score trending = score base - penalización por antigüedad + factor aleatorio pequeño
      const trendingScoreA = a.score - recencyA + (Math.random() * 0.5);
      const trendingScoreB = b.score - recencyB + (Math.random() * 0.5);
      
      return trendingScoreB - trendingScoreA;
    });

    return sortedTrending.slice(0, limit);
    
  } catch (error) {
    console.error('Error obteniendo contenido trending:', error);
    return [];
  }
}

export async function getPopularMovies(limit: number = 12): Promise<TrendingItem[]> {
  try {
    const pagesToFetch = [1, 2, 3, 4]; // Más páginas para mejor selección
    
    const moviesPromises = await Promise.all(
      pagesToFetch.map(page => fetchMovies(page))
    );

    const allMovies: MovieDatum[] = [];
    moviesPromises.forEach(response => {
      allMovies.push(...response.data);
    });

    return allMovies
      .filter(movie => movie.score >= 6.5) // Score mínimo para popularidad
      .sort((a, b) => {
        // Combinar score y año para determinar popularidad
        const scoreWeightA = a.score * 0.7 + (parseInt(a.year) >= 2020 ? 2 : 0);
        const scoreWeightB = b.score * 0.7 + (parseInt(b.year) >= 2020 ? 2 : 0);
        return scoreWeightB - scoreWeightA;
      })
      .slice(0, limit)
      .map(movie => ({
        id: movie.id,
        name: movie.name,
        slug: movie.slug,
        image: movie.image,
        score: movie.score,
        year: movie.year,
        type: 'movie' as const
      }));
      
  } catch (error) {
    console.error('Error obteniendo películas populares:', error);
    return [];
  }
}

export async function getAcclaimedSeries(limit: number = 12): Promise<TrendingItem[]> {
  try {
    const pagesToFetch = [1, 2, 3, 4];
    
    const seriesPromises = await Promise.all(
      pagesToFetch.map(page => fetchSeries(page))
    );

    const allSeries: SerieDatum[] = [];
    seriesPromises.forEach(response => {
      allSeries.push(...response.data);
    });

    return allSeries
      .filter(serie => serie.score >= 7.0) // Score más alto para series "aclamadas"
      .sort((a, b) => b.score - a.score) // Ordenar solo por score para aclamadas
      .slice(0, limit)
      .map(serie => ({
        id: serie.id,
        name: serie.name,
        slug: serie.slug,
        image: serie.image,
        score: serie.score,
        year: serie.year,
        type: 'series' as const
      }));
      
  } catch (error) {
    console.error('Error obteniendo series aclamadas:', error);
    return [];
  }
}

export async function getRecentContent(
  mediaType: 'movies' | 'series', 
  limit: number = 10
): Promise<TrendingItem[]> {
  try {
    const currentYear = new Date().getFullYear();
    const pagesToFetch = [1, 2, 3];
    
    if (mediaType === 'movies') {
      const moviesPromises = await Promise.all(
        pagesToFetch.map(page => fetchMovies(page))
      );

      const allMovies: MovieDatum[] = [];
      moviesPromises.forEach(response => {
        allMovies.push(...response.data);
      });

      return allMovies
        .filter(movie => {
          const movieYear = parseInt(movie.year);
          return movieYear >= currentYear - 3 && movie.score >= 6.0; // Últimos 3 años
        })
        .sort((a, b) => {
          // Priorizar año reciente y score
          const yearDiffA = currentYear - parseInt(a.year);
          const yearDiffB = currentYear - parseInt(b.year);
          if (yearDiffA !== yearDiffB) {
            return yearDiffA - yearDiffB; // Más reciente primero
          }
          return b.score - a.score; // Luego por score
        })
        .slice(0, limit)
        .map(movie => ({
          id: movie.id,
          name: movie.name,
          slug: movie.slug,
          image: movie.image,
          score: movie.score,
          year: movie.year,
          type: 'movie' as const
        }));
    } else {
      const seriesPromises = await Promise.all(
        pagesToFetch.map(page => fetchSeries(page))
      );

      const allSeries: SerieDatum[] = [];
      seriesPromises.forEach(response => {
        allSeries.push(...response.data);
      });

      return allSeries
        .filter(serie => {
          const serieYear = parseInt(serie.year);
          return serieYear >= currentYear - 3 && serie.score >= 6.0;
        })
        .sort((a, b) => {
          const yearDiffA = currentYear - parseInt(a.year);
          const yearDiffB = currentYear - parseInt(b.year);
          if (yearDiffA !== yearDiffB) {
            return yearDiffA - yearDiffB;
          }
          return b.score - a.score;
        })
        .slice(0, limit)
        .map(serie => ({
          id: serie.id,
          name: serie.name,
          slug: serie.slug,
          image: serie.image,
          score: serie.score,
          year: serie.year,
          type: 'series' as const
        }));
    }
    
  } catch (error) {
    console.error('Error obteniendo contenido reciente:', error);
    return [];
  }
}
