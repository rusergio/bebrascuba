import { useState } from 'react';
import { useInterval } from '@mantine/hooks';
import { Button, Progress, useMantineTheme, rgba } from '@mantine/core';
import classes from '../styles/BotonCargarCSV.module.css';

export function BotonCargarCSV() {
  const theme = useMantineTheme();
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const interval = useInterval(
    () =>
      setProgress((current) => {
        if (current < 100) {
          return current + 1;
        }

        interval.stop();
        setLoaded(true);
        return 0;
      }),
    20
  );

  return (
    <Button
      fullWidth
      className={classes.button}
      onClick={() => (loaded ? setLoaded(false) : !interval.active && interval.start())}
      color={loaded ? 'teal' : theme.primaryColor}
      mt={20}
    >
      <div className={classes.label}>
        {progress !== 0 ? 'Cargando datos' : loaded ? 'CSV cargado' : 'Cargar CSV'}
      </div>
      {progress !== 0 && (
        <Progress
          value={progress}
          className={classes.progress}
          color={rgba(theme.colors.blue[2], 0.35)}
          radius="sm"
        />
      )}
    </Button>
  );
}