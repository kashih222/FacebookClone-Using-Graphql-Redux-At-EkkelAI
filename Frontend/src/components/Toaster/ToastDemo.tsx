import { Toaster as HotToaster, toast } from 'react-hot-toast';

const notify = () => toast('Here is your toast.');

const ToastDemo = () => {
  return (
    <div>
      <button onClick={notify}>Make me a toast</button>

      <HotToaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          className: '',
          duration: 3000,
          removeDelay: 1000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: 'green',
              secondary: 'black',
            },
          },
        }}
      />
    </div>
  );
};

export default ToastDemo;
