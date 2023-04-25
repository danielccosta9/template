import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as yup from 'yup';

import { AgendaService } from "@/app/shared/services/api/agenda/AgendaService";
import { FerramentasDeDetalhe } from '@/app/shared/components';
import { LayoutBaseDePagina } from '@/app/shared/layouts';
import { IVFormErrors, VForm, VTextField, useVForm } from '@/app/shared/forms';
import { Box, Grid, LinearProgress, Paper, Typography } from '@mui/material';


interface IFormData {
  pacienteNome: string;
    pacienteCPF: string;
    pacienteTelefone: string;
    agendaHoraSaida: string;
    agendaMarcado: string;
    hospitalNome: string;
    agendaStatus: string;
    agendaCarro: string;
    agendaData: string;
}
const formValidationSchema: yup.Schema<IFormData> = yup.object().shape({
  pacienteNome: yup.string().required('Nome é obrigatório'),
  pacienteCPF: yup.string().required('CPF é obrigatório'),
  pacienteTelefone: yup.string().required('Telefone é obrigatório'),
  agendaHoraSaida: yup.string().required('Hora de saída é obrigatório'),
  agendaMarcado: yup.string().required('Marcado é obrigatório'),
  hospitalNome: yup.string().required('Hospital é obrigatório'),
  agendaStatus: yup.string().required('Status é obrigatório'),
  agendaCarro: yup.string().required('Carro é obrigatório'),
  agendaData: yup.string().required('Data é obrigatório'),
});

export const DetalheDeAgenda: React.FC = () => {
  const { id = 'novo' } = useParams<'id'>();
  const { formRef, save, saveAndClose, isSaveAndClose } = useVForm();
  const navigate = useNavigate();


  const [isLoading, setIsLoading] = useState(false);
  const [nome, setNome] = useState('');

  useEffect(() => {
    if (id !== 'novo') {
      setIsLoading(true);
      AgendaService.getById(Number(id))
        .then((result) => {
          setIsLoading(false);
          if (result instanceof Error) {
            alert(result.message);
            navigate('/agenda');
          } else {
            setNome(result.hospitalNome);
            console.log(result);
            formRef.current?.setData(result);
          }
        });
    }
  }, [formRef, navigate, id]);

  const handleSave = (dados: IFormData) => {

    formValidationSchema.
      validate(dados, { abortEarly: false })
      .then((dadosValidados) => {
        setIsLoading(true);

        if (id === 'novo') {
          AgendaService
            .create(dadosValidados)
            .then((result) => {
              setIsLoading(false);

              if (result instanceof Error) {
                alert(result.message);
              } else {
                if (isSaveAndClose()) {
                  navigate('/agenda');
                } else {
                  navigate(`/agenda/detalhe/${result}`);
                }
              }
            });
        } else {
          AgendaService
            .updateById(Number(id), { id: Number(id), ...dadosValidados })
            .then((result) => {
              setIsLoading(false);

              if (result instanceof Error) {
                alert(result.message);
              } else {
                if (isSaveAndClose()) {
                  navigate('/agenda');
                }
              }
            });
        }
      })
      .catch((errors: yup.ValidationError) => {
        const validationErrors: IVFormErrors = {};

        errors.inner.forEach(error => {
          if (!error.path) return;

          validationErrors[error.path] = error.message;
        });

        formRef.current?.setErrors(validationErrors);
      });
  };



  const handleDelete = (id: number) => {
    if (confirm('Realmente deseja apagar?')) {
      AgendaService.deleteById(id)
        .then(result => {
          if (result instanceof Error) {
            alert(result.message);
          } else {
            alert('Registro apagado com sucesso!');
            navigate('/agenda');
          }
        });
    }
  };


  return (
    <LayoutBaseDePagina
      titulo={id === 'novo' ? 'Novo Agendamento' : nome}
      barraDeFerramentas={
        <FerramentasDeDetalhe
          textoBotaoNovo='Novo'
          mostrarBotaoNovo={id !== 'novo'}
          mostrarBotaoApagar={id !== 'novo'}

          aoClicarEmVoltar={() => navigate('/agenda')}
          aoClicarEmApagar={() => handleDelete(Number(id))}
          aoClicarEmNovo={() => navigate('/agenda/detalhe/novo')}
          aoClicarEmSalvar={() => formRef.current?.submitForm()}
        />
      }
    >
      <VForm ref={formRef} onSubmit={handleSave}>
        <Box margin={1} display="flex" flexDirection="column" component={Paper} variant="outlined">

          {isLoading && (
            <Grid item >
              <LinearProgress />
            </Grid>
          )}

          <Grid item>
            <Typography variant="h6" component="div" sx={{ p: 2 }}> Agendar Paciente </Typography>
          </Grid>

          <Grid container direction="row" padding={2} spacing={2}>
            <Grid item xs={12} sm={6}>
              <VTextField
                name='hospitalNome'
                label='Nome'
                variant='outlined'
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <VTextField
                name='hospitalEstado'
                label='Estado'
                variant='outlined'
                fullWidth
              />
            </Grid>
          </Grid>
        </Box>
      </VForm>
    </LayoutBaseDePagina >
  );
};