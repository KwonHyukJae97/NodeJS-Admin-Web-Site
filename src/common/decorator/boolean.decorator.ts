import { Transform } from 'class-transformer';

/**
 * dto validator 적용 시, 요청에 맞는 boolean 값으로 변환해주는 커스텀 데코레이터
 */
export const ToBoolean = () => {
  return Transform(({ obj, key }) => valueToBoolean(obj[key]));
};

const valueToBoolean = (value: any) => {
  if (value === 'true') {
    return true;
  }
  return false;
};
