import { ApiResponse } from '#src/core/api/ApiResponse';
import { ModelDto } from '#src/core/dto/ModelDto';
import { OptionDto } from '#src/app/options/dtos/option.dto';
import { getListOptionService } from '#src/app/options/options.service';
import { getListOptionFromCache, setListOptionToCache } from '#src/app/options/options-cache.service';

export const getListOptionsController = async () => {
  let options = await getListOptionFromCache({});

  if (options.length === 0) {
    options = await getListOptionService();
    await setListOptionToCache({}, options);
  }

  const optionsDto = ModelDto.newList(OptionDto, options);
  return ApiResponse.success(optionsDto);
};
