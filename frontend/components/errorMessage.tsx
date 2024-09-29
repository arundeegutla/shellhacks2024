import { ErrorOutline } from "@mui/icons-material";
import { Alert, AlertTitle } from '@mui/material';

interface ErrorBoxProps {
  error: string;
}

function ErrorMessage({ error }: ErrorBoxProps) {
  return (
    <Alert severity="error">
      {error}
    </Alert>
  );
  // return <div className="error-box" >
  //     <ErrorOutline className="error-icon" />
  //         { error }
  //         </div>;
}

export default ErrorMessage;
