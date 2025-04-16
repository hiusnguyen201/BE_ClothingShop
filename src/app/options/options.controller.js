import { ApiResponse } from '#src/core/api/ApiResponse';
import { ModelDto } from '#src/core/dto/ModelDto';
import { OptionDto } from '#src/app/options/dtos/option.dto';
import { getListOptionService } from '#src/app/options/options.service';

export const getListOptionsController = async () => {
  const options = await getListOptionService();
  const optionsDto = ModelDto.newList(OptionDto, options);
  return ApiResponse.success(optionsDto);
};
