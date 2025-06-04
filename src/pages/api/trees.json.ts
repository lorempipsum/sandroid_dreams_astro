import type { APIRoute } from 'astro';
import { promises as fs } from 'fs';
import path from 'path';

export const GET: APIRoute = async () => {
  try {
    const filePath = path.join(
      process.cwd(),
      'public',
      'bristol-data',
      'Trees.json'
    );
    const rawData = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(rawData);

    const processedTrees = data.features
      .filter(
        (feature) =>
          feature.geometry?.coordinates &&
          Array.isArray(feature.geometry.coordinates) &&
          feature.geometry.coordinates.length === 2
      )
      .map((feature) => ({
        id: `tree-${feature.properties.ASSET_ID}`,
        name:
          feature.properties.COMMON_NAME ||
          feature.properties.SPECIES ||
          'Unknown Tree',
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
        species: feature.properties.TREE_SPECIES || 'Unknown',
        commonName:
          feature.properties.FULL_COMMON_NAME ||
          feature.properties.COMMON_NAME ||
          'Unknown',
        latinName: feature.properties.LATIN_NAME || 'Unknown',
        height: feature.properties.CROWN_HEIGHT || 0,
        crownWidth: feature.properties.CROWN_WIDTH || 0,
        age: feature.properties.AGE_DESC || 'Unknown',
        condition: feature.properties.CONDITION || 'Unknown',
        deadFlag: feature.properties.DEAD_FLAG || 'Unknown',
      }));

    return new Response(JSON.stringify(processedTrees), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error processing tree data:', error);
    return new Response(JSON.stringify({ error: 'Failed to load tree data' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
