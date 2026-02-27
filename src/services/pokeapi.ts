/**
 * ============================================================
 *  pokeapi.ts  —  Servicio centralizado de PokeAPI con Axios
 * ============================================================
 *
 *  Uso en páginas .astro (script de cliente):
 *    import { PokeService } from '/src/services/pokeapi.ts'
 *
 *  Uso desde CDN (cuando el módulo no está disponible en cliente):
 *    El servicio también expone window.PokeService
 * ============================================================
 */

// ─── Tipos ──────────────────────────────────────────────────

export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

export interface PokemonType {
  slot: number;
  type: { name: string; url: string };
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: { name: string; url: string };
}

export interface PokemonAbility {
  ability: { name: string; url: string };
  is_hidden: boolean;
  slot: number;
}

export interface PokemonMove {
  move: { name: string; url: string };
}

export interface PokemonSprites {
  front_default: string;
  other: {
    'official-artwork': { front_default: string; front_shiny: string };
    dream_world: { front_default: string };
    home: { front_default: string };
  };
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  types: PokemonType[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  moves: PokemonMove[];
  sprites: PokemonSprites;
}

export interface PokemonSpecies {
  id: number;
  name: string;
  base_happiness: number;
  capture_rate: number;
  color: { name: string };
  generation: { name: string; url: string };
  flavor_text_entries: Array<{
    flavor_text: string;
    language: { name: string };
    version: { name: string };
  }>;
  evolution_chain: { url: string };
  evolves_from_species: { name: string; url: string } | null;
}

export interface PokemonSummary {
  id: number;
  name: string;
  image: string;
  types: string[];
}

// ─── Configuración de Axios (inline para uso en browser) ────

const BASE_URL = 'https://pokeapi.co/api/v2';
const TIMEOUT  = 10_000; // 10 segundos

/**
 * Crea una instancia liviana de "axios" usando fetch nativo
 * con la misma interfaz que se espera en browser sin bundler.
 * Cuando axios está disponible (post npm install), usa axios real.
 */
function createClient() {
  // Intentar usar axios si está disponible en window
  if (typeof window !== 'undefined' && (window as any).axios) {
    const instance = (window as any).axios.create({
      baseURL: BASE_URL,
      timeout: TIMEOUT,
      headers: { 'Accept': 'application/json' },
    });

    // ── Interceptor de REQUEST ──────────────────────────────
    instance.interceptors.request.use(
      (config: any) => {
        console.groupCollapsed(`%c🌐 [PokeAPI] ${config.method?.toUpperCase()} ${config.url}`, 'color:#FFD600;font-weight:bold');
        console.log('Base URL:', BASE_URL);
        console.log('Params:', config.params || 'ninguno');
        console.log('Timestamp:', new Date().toISOString());
        console.groupEnd();
        return config;
      },
      (error: any) => {
        console.error('❌ [PokeAPI] Error en request:', error);
        return Promise.reject(error);
      }
    );

    // ── Interceptor de RESPONSE ─────────────────────────────
    instance.interceptors.response.use(
      (response: any) => {
        console.groupCollapsed(`%c✅ [PokeAPI] ${response.status} ${response.config.url}`, 'color:#00E676;font-weight:bold');
        console.log('Status:', response.status, response.statusText);
        console.log('Datos recibidos:', response.data);
        console.groupEnd();
        return response;
      },
      (error: any) => {
        const status = error.response?.status;
        const url    = error.config?.url;
        console.group(`%c❌ [PokeAPI] Error ${status ?? 'RED'} en ${url}`, 'color:#FF1744;font-weight:bold');
        if (status === 404)  console.warn('Recurso no encontrado (404)');
        if (status === 429)  console.warn('Demasiadas peticiones — rate limit (429)');
        if (!status)         console.warn('Sin respuesta del servidor (posible timeout o sin internet)');
        console.error(error.message);
        console.groupEnd();
        return Promise.reject(error);
      }
    );

    return instance;
  }

  // ── Fallback: fetch nativo con la misma interfaz ──────────
  return {
    async get(url: string, config?: { params?: Record<string, any> }) {
      const qs = config?.params
        ? '?' + new URLSearchParams(config.params).toString()
        : '';
      const fullUrl = url.startsWith('http') ? url + qs : `${BASE_URL}${url}${qs}`;

      console.log(`%c🌐 [PokeAPI-fetch] GET ${fullUrl}`, 'color:#FFD600');

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT);

      try {
        const res = await fetch(fullUrl, { signal: controller.signal });
        clearTimeout(timer);
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const data = await res.json();
        console.log(`%c✅ [PokeAPI-fetch] ${res.status} OK`, 'color:#00E676');
        return { data, status: res.status };
      } catch (err: any) {
        clearTimeout(timer);
        console.error(`%c❌ [PokeAPI-fetch] ${err.message}`, 'color:#FF1744');
        throw err;
      }
    }
  };
}

// ─── Servicio público ────────────────────────────────────────

export const PokeService = {

  /** Instancia del cliente HTTP (axios o fetch) */
  get client() { return createClient(); },

  /**
   * Lista Pokémon con paginación
   * @param limit   Cantidad de Pokémon (default 20)
   * @param offset  Desde qué posición (default 0)
   */
  async getList(limit = 20, offset = 0): Promise<PokemonListResponse> {
    const { data } = await this.client.get('/pokemon', { params: { limit, offset } });
    return data as PokemonListResponse;
  },

  /**
   * Obtiene datos completos de un Pokémon por ID o nombre
   */
  async getById(idOrName: string | number): Promise<Pokemon> {
    const { data } = await this.client.get(`/pokemon/${idOrName}`);
    return data as Pokemon;
  },

  /**
   * Obtiene datos de especie (descripción, generación, etc.)
   */
  async getSpecies(idOrName: string | number): Promise<PokemonSpecies> {
    const { data } = await this.client.get(`/pokemon-species/${idOrName}`);
    return data as PokemonSpecies;
  },

  /**
   * Obtiene Pokémon + especie en paralelo (optimizado)
   */
  async getFullDetail(idOrName: string | number): Promise<{ pokemon: Pokemon; species: PokemonSpecies | null }> {
    const [pokemonResult, speciesResult] = await Promise.allSettled([
      this.getById(idOrName),
      this.getSpecies(idOrName),
    ]);

    const pokemon = pokemonResult.status === 'fulfilled'
      ? pokemonResult.value
      : (() => { throw pokemonResult.reason; })();

    const species = speciesResult.status === 'fulfilled'
      ? speciesResult.value
      : null; // La especie no es crítica

    return { pokemon, species };
  },

  /**
   * Obtiene un resumen simple de un Pokémon (id, nombre, imagen, tipos)
   * Útil para tarjetas de la lista
   */
  async getSummary(idOrName: string | number): Promise<PokemonSummary> {
    const poke = await this.getById(idOrName);
    return {
      id:    poke.id,
      name:  poke.name,
      image: poke.sprites.other['official-artwork'].front_default
          || poke.sprites.other.home?.front_default
          || poke.sprites.front_default,
      types: poke.types.map(t => t.type.name),
    };
  },

  /**
   * Obtiene múltiples Pokémon en paralelo por sus URLs o IDs
   */
  async getMany(idsOrUrls: (string | number)[]): Promise<PokemonSummary[]> {
    const results = await Promise.allSettled(
      idsOrUrls.map(idOrUrl => {
        const isUrl = typeof idOrUrl === 'string' && idOrUrl.startsWith('http');
        return isUrl
          ? this.client.get(idOrUrl as string).then(r => r.data as Pokemon)
          : this.getById(idOrUrl);
      })
    );

    return results
      .filter((r): r is PromiseFulfilledResult<Pokemon> => r.status === 'fulfilled')
      .map(r => ({
        id:    r.value.id,
        name:  r.value.name,
        image: r.value.sprites.other['official-artwork'].front_default || r.value.sprites.front_default,
        types: r.value.types.map((t: PokemonType) => t.type.name),
      }));
  },

  /**
   * Carga una lista completa en lotes para no saturar la API
   * @param limit      Total de Pokémon a cargar
   * @param batchSize  Cuántos cargar por batch (default 20)
   * @param onBatch    Callback llamado después de cada batch (para UI progresiva)
   */
  async loadAll(
    limit: number,
    batchSize = 20,
    onBatch?: (batch: PokemonSummary[], total: PokemonSummary[]) => void
  ): Promise<PokemonSummary[]> {
    const listResponse = await this.getList(limit, 0);
    const urls = listResponse.results.map(p => p.url);
    const allResults: PokemonSummary[] = [];

    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      const summaries = await this.getMany(batch);
      allResults.push(...summaries);
      onBatch?.(summaries, [...allResults]);
    }

    return allResults;
  },

  /**
   * Obtiene el texto de descripción en español o inglés
   */
  getFlavorText(species: PokemonSpecies): string {
    const entry = species.flavor_text_entries.find(e => e.language.name === 'es')
               || species.flavor_text_entries.find(e => e.language.name === 'en');
    return entry?.flavor_text.replace(/\f|\n/g, ' ') ?? 'Sin descripción disponible.';
  },

  /**
   * Formatea el nombre de una generación para mostrar en UI
   * "generation-i" → "Generación I"
   */
  formatGeneration(genName: string): string {
    return genName
      .replace('generation-', 'Generación ')
      .toUpperCase()
      .replace('GENERACIÓN ', 'Generación ');
  },
};

// Exponer en window para uso en scripts inline de .astro
if (typeof window !== 'undefined') {
  (window as any).PokeService = PokeService;
}
