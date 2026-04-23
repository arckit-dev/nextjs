import { ICON_LG } from '@arckit/daisyui/icons';
import toast from 'react-hot-toast';
import { RiCloseCircleLine } from 'react-icons/ri';
import type { ServerActionError } from '../action';

export const toastError =
  <TError extends string>(formatError: (error: TError) => string) =>
  ({ error }: ServerActionError<TError>) => {
    toast.error(formatError(error), {
      icon: <RiCloseCircleLine size={ICON_LG} />
    });
  };
