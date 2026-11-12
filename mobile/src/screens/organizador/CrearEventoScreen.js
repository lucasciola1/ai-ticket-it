import { Pressable, ScrollView } from 'react-native';
import styled from '@emotion/native';
import { useTheme } from '@emotion/react';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons/static';
import { useCarga } from '../../hooks/useCarga';
import { useFormulario } from '../../hooks/useFormulario';
import { obtenerCategorias } from '../../services/categoriaService';
import { crearEvento } from '../../services/eventoService';
import { Boton } from '../../components/Boton';
import { Campo } from '../../components/Campo';
import { Chip } from '../../components/Chip';
import { AvisoError, Formulario } from '../../components/Formulario';
import { PantallaScroll, Subtitulo, TextoError, TextoSecundario } from '../../components/Textos';
import { formatearFecha } from '../../utils/formato';

const TIPO_VACIO = { nombre: '', descripcion: '', precio: '', cupo: '' };

const Seccion = styled.View`
  gap: ${({ theme }) => `${theme.espacio.s}px`};
  margin-top: ${({ theme }) => `${theme.espacio.m}px`};
`;

const SelectorFecha = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  padding: 10px 14px;
  border-width: 1px;
  border-radius: ${({ theme }) => `${theme.radio.m}px`};
  border-color: ${({ theme, conError }) => (conError ? theme.colores.error : theme.colores.borde)};
  background-color: ${({ theme }) => theme.colores.superficie};
`;

const TextoFecha = styled.Text`
  font-size: ${({ theme }) => `${theme.fuente.normal}px`};
  color: ${({ theme, vacio }) => (vacio ? theme.colores.textoSecundario : theme.colores.texto)};
`;

const TarjetaTipo = styled.View`
  padding: ${({ theme }) => `${theme.espacio.m}px`};
  padding-bottom: 0px;
  border-radius: ${({ theme }) => `${theme.radio.m}px`};
  background-color: ${({ theme }) => theme.colores.primarioSuave};
`;

const FilaEntre = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => `${theme.espacio.s}px`};
`;

const DosColumnas = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => `${theme.espacio.s}px`};
`;

const Columna = styled.View`
  flex: 1;
`;

const FilaUrl = styled.View`
  flex-direction: row;
  align-items: flex-start;
  gap: 8px;
`;

const chipsContenido = { gap: 8 };

const soloDigitos = (texto) => texto.replace(/[^0-9]/g, '');

/** Mañana a las 21 hs: valor inicial razonable para el calendario. */
const fechaSugerida = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(21, 0, 0, 0);
  return d;
};

export function CrearEventoScreen({ navigation }) {
  const theme = useTheme();
  const categorias = useCarga(obtenerCategorias, []);
  const { valores, setValores, setValorDe, errores, error, enviando, enviar } = useFormulario({
    nombre: '',
    descripcion: '',
    categoriaId: null,
    fecha: null,
    lugar: '',
    multimedia: [''],
    tiposEntrada: [{ ...TIPO_VACIO, nombre: 'General' }],
  });

  // ---------- Fecha: calendario nativo y después reloj ----------
  const elegirFecha = () => {
    DateTimePickerAndroid.open({
      value: valores.fecha ?? fechaSugerida(),
      mode: 'date',
      minimumDate: new Date(),
      onValueChange: (_evento, dia) => {
        DateTimePickerAndroid.open({
          value: dia,
          mode: 'time',
          is24Hour: true,
          onValueChange: (_e, fechaYHora) => setValorDe('fecha')(fechaYHora),
        });
      },
    });
  };

  // ---------- Tipos de entrada (lista dinámica) ----------
  const setTipo = (indice, campo) => (valor) =>
    setValores((v) => ({
      ...v,
      tiposEntrada: v.tiposEntrada.map((t, i) => (i === indice ? { ...t, [campo]: valor } : t)),
    }));
  const agregarTipo = () => setValores((v) => ({ ...v, tiposEntrada: [...v.tiposEntrada, { ...TIPO_VACIO }] }));
  const quitarTipo = (indice) =>
    setValores((v) => ({ ...v, tiposEntrada: v.tiposEntrada.filter((_, i) => i !== indice) }));

  // ---------- Fotos (URLs) ----------
  const setUrl = (indice) => (url) =>
    setValores((v) => ({ ...v, multimedia: v.multimedia.map((u, i) => (i === indice ? url : u)) }));
  const agregarUrl = () => setValores((v) => ({ ...v, multimedia: [...v.multimedia, ''] }));
  const quitarUrl = (indice) => setValores((v) => ({ ...v, multimedia: v.multimedia.filter((_, i) => i !== indice) }));

  const publicar = async () => {
    const creado = await enviar(crearEvento);
    if (creado) {
      navigation.replace('DetalleEvento', { eventoId: creado.id });
    }
  };

  return (
    <PantallaScroll keyboardShouldPersistTaps="handled">
      <Formulario>
        <AvisoError mensaje={error} />

        <Campo
          etiqueta="Nombre del evento"
          value={valores.nombre}
          onChangeText={setValorDe('nombre')}
          error={errores.nombre}
          placeholder="Ej: Noche de Jazz"
        />
        <Campo
          etiqueta="Descripción"
          value={valores.descripcion}
          onChangeText={setValorDe('descripcion')}
          error={errores.descripcion}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <Subtitulo>Categoría</Subtitulo>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={chipsContenido}>
          {(categorias.datos ?? []).map((c) => (
            <Chip
              key={c.id}
              etiqueta={c.nombre}
              seleccionado={valores.categoriaId === c.id}
              onPress={() => setValorDe('categoriaId')(c.id)}
            />
          ))}
        </ScrollView>
        {errores.categoriaId ? <TextoError>{errores.categoriaId}</TextoError> : null}

        <Seccion>
          <Subtitulo>Fecha y hora</Subtitulo>
          <SelectorFecha onPress={elegirFecha} conError={Boolean(errores.fecha)} accessibilityRole="button" accessibilityLabel="Elegir fecha y hora">
            <MaterialDesignIcons name="calendar-month-outline" size={22} color={theme.colores.primario} />
            <TextoFecha vacio={!valores.fecha}>
              {valores.fecha ? formatearFecha(valores.fecha) : 'Elegí el día en el calendario'}
            </TextoFecha>
          </SelectorFecha>
          {errores.fecha ? <TextoError>{errores.fecha}</TextoError> : null}
        </Seccion>

        <Seccion>
          <Campo
            etiqueta="Lugar"
            value={valores.lugar}
            onChangeText={setValorDe('lugar')}
            error={errores.lugar}
            placeholder="Ej: Teatro Gran Rex, CABA"
          />
        </Seccion>

        <Seccion>
          <Subtitulo>Tipos de entrada</Subtitulo>
          <TextoSecundario>Cada tipo tiene su precio y su cupo (ej: General, Platea, VIP).</TextoSecundario>
          {errores.tiposEntrada ? <TextoError>{errores.tiposEntrada}</TextoError> : null}
          {valores.tiposEntrada.map((tipo, i) => (
            // key por índice: los tipos todavía no tienen id (los inputs son controlados, el valor sale del estado)
            <TarjetaTipo key={i}>
              <FilaEntre>
                <Subtitulo>{`Tipo ${i + 1}`}</Subtitulo>
                {valores.tiposEntrada.length > 1 ? (
                  <MaterialDesignIcons
                    name="trash-can-outline"
                    size={22}
                    color={theme.colores.error}
                    onPress={() => quitarTipo(i)}
                    accessibilityLabel={`Quitar tipo ${i + 1}`}
                  />
                ) : null}
              </FilaEntre>
              <Campo
                etiqueta={`Nombre del tipo ${i + 1}`}
                value={tipo.nombre}
                onChangeText={setTipo(i, 'nombre')}
                error={errores[`tiposEntrada.${i}.nombre`]}
              />
              <DosColumnas>
                <Columna>
                  <Campo
                    etiqueta={`Precio del tipo ${i + 1}`}
                    value={tipo.precio}
                    onChangeText={(t) => setTipo(i, 'precio')(soloDigitos(t))}
                    error={errores[`tiposEntrada.${i}.precio`]}
                    keyboardType="number-pad"
                    placeholder="$"
                  />
                </Columna>
                <Columna>
                  <Campo
                    etiqueta={`Cupo del tipo ${i + 1}`}
                    value={tipo.cupo}
                    onChangeText={(t) => setTipo(i, 'cupo')(soloDigitos(t))}
                    error={errores[`tiposEntrada.${i}.cupo`]}
                    keyboardType="number-pad"
                  />
                </Columna>
              </DosColumnas>
            </TarjetaTipo>
          ))}
          <Boton titulo="+ Agregar tipo de entrada" variante="secundario" onPress={agregarTipo} />
        </Seccion>

        <Seccion>
          <Subtitulo>Fotos (opcional)</Subtitulo>
          <TextoSecundario>Pegá links a imágenes del evento.</TextoSecundario>
          {valores.multimedia.map((url, i) => (
            // key por índice: las URLs pueden repetirse mientras se escriben
            <FilaUrl key={i}>
              <Columna>
                <Campo
                  etiqueta={`Foto ${i + 1}`}
                  value={url}
                  onChangeText={setUrl(i)}
                  error={errores[`multimedia.${i}`]}
                  autoCapitalize="none"
                  keyboardType="url"
                  placeholder="https://…"
                />
              </Columna>
              {valores.multimedia.length > 1 ? (
                <MaterialDesignIcons
                  name="close"
                  size={22}
                  color={theme.colores.textoSecundario}
                  onPress={() => quitarUrl(i)}
                  accessibilityLabel={`Quitar foto ${i + 1}`}
                />
              ) : null}
            </FilaUrl>
          ))}
          <Boton titulo="+ Agregar foto" variante="secundario" onPress={agregarUrl} />
        </Seccion>

        <Seccion>
          <Boton titulo="Publicar evento" onPress={publicar} cargando={enviando} />
        </Seccion>
      </Formulario>
    </PantallaScroll>
  );
}
