import styled from '@emotion/native';
import { useFormulario } from '../../hooks/useFormulario';
import { reseniarCompra } from '../../services/compraService';
import { Boton } from '../../components/Boton';
import { Campo } from '../../components/Campo';
import { Estrellas } from '../../components/Estrellas';
import { AvisoError, Formulario } from '../../components/Formulario';
import { PantallaScroll, TextoError, TextoSecundario, Titulo } from '../../components/Textos';

const EstrellasCentradas = styled.View`
  align-items: center;
  padding: ${({ theme }) => `${theme.espacio.l}px 0px`};
  gap: ${({ theme }) => `${theme.espacio.s}px`};
`;

const ETIQUETAS = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', '¡Excelente!'];

export function ReseniarScreen({ route, navigation }) {
  const { compraId } = route.params;
  const { valores, setValorDe, errores, error, enviando, enviar } = useFormulario({
    puntuacion: 0,
    detalle: '',
  });

  const publicar = async () => {
    const resenia = await enviar(({ puntuacion, detalle }) =>
      // 0 = sin elegir: se manda igual y el back responde con el error de validación
      reseniarCompra(compraId, { puntuacion, detalle }),
    );
    if (resenia) {
      navigation.goBack();
    }
  };

  return (
    <PantallaScroll keyboardShouldPersistTaps="handled">
      <Formulario>
        <Titulo>¿Qué te pareció el evento?</Titulo>
        <TextoSecundario>Tu reseña ayuda a otros compradores a conocer al organizador.</TextoSecundario>
        <AvisoError mensaje={error} />

        <EstrellasCentradas>
          <Estrellas valor={valores.puntuacion} onCambiar={setValorDe('puntuacion')} tamanio={44} />
          <TextoSecundario>{ETIQUETAS[valores.puntuacion] || 'Tocá las estrellas para puntuar'}</TextoSecundario>
          {errores.puntuacion ? <TextoError>{errores.puntuacion}</TextoError> : null}
        </EstrellasCentradas>

        <Campo
          etiqueta="Comentario (opcional)"
          value={valores.detalle}
          onChangeText={setValorDe('detalle')}
          error={errores.detalle}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={1000}
          placeholder="Contá cómo estuvo el sonido, la organización, el acceso…"
        />
        <Boton titulo="Publicar reseña" onPress={publicar} cargando={enviando} />
      </Formulario>
    </PantallaScroll>
  );
}
