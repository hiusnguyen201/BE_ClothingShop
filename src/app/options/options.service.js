import { getListOptionRepository } from '#src/app/options/options.repository';
import { getOptionsFromCache, setOptionsToCache } from '#src/app/options/options.cache';

export async function getOptionsService() {
  const cached = await getOptionsFromCache();
  if (cached && Array.isArray(cached) && cached.length > 0) return cached;

  const options = await getListOptionRepository();
  await setOptionsToCache({}, options);

  return options;
}
