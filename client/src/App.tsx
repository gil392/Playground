import { useState } from "react";
import {
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Stack,
} from "@mui/material";
import axios from "axios";

const API_BASE = "http://localhost:3001";

function App() {
  const [a, setA] = useState<string>("");
  const [b, setB] = useState<string>("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalc = async (operation: "add" | "divide") => {
    setResult(null);
    setError(null);

    try {
      const res = await axios.get(`${API_BASE}/${operation}`, {
        params: { a, b },
      });
      setResult(`Result: ${res.data.result}`);
    } catch (err: any) {
      setError(err.response?.data || "Unknown error");
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 6, borderRadius: 3 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Calculator
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Number A"
            type="number"
            value={a}
            onChange={(e) => setA(e.target.value)}
            fullWidth
          />
          <TextField
            label="Number B"
            type="number"
            value={b}
            onChange={(e) => setB(e.target.value)}
            fullWidth
          />
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button variant="contained" onClick={() => handleCalc("add")}>
              Add
            </Button>
            <Button variant="contained" onClick={() => handleCalc("divide")}>
              Multiply
            </Button>
          </Stack>
          {result && (
            <Typography variant="h6" color="primary" align="center">
              {result}
            </Typography>
          )}
          {error && (
            <Typography variant="h6" color="error" align="center">
              {error}
            </Typography>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}

export default App;
