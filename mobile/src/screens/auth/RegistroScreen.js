import { useAuth } from '../../context/AuthContext';
import { useFormulario } from '../../hooks/useFormulario';
import { Boton } from '../../components/Boton';
import { Campo } from '../../components/Campo';
import { AvisoError, Enlace, Formulario } from '../../components/Formulario';
import { PantallaScroll, TextoSecundario, Titulo } from '../../components/Textos';

export function RegistroScreen({ navigation }) {
  const { registrar } = useAuth();
  const { valores, setValorDe, errores, error, enviando, enviar } = useFormulario({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
  });

  const crearCuenta = async () => {
    const usuario = await enviar(registrar);
    if (usuario) {
      navigation.goBack();
    }
  };

  return (
    <PantallaScroll keyboardShouldPersistTaps="handled">
      <Formulario>
        <Titulo>Creá tu cuenta</Titulo>
        <TextoSecundario>Con una sola cuenta podés comprar entradas y organizar eventos.</TextoSecundario>
        <AvisoError mensaje={error} />
        <Campo
          etiqueta="Nombre"
          value={valores.nombre}
          onChangeText={setValorDe('nombre')}
          error={errores.nombre}
          autoComplete="given-name"
        />
        <Campo
          etiqueta="Apellido"
          value={valores.apellido}
          onChangeText={setValorDe('apellido')}
          error={errores.apellido}
          autoComplete="family-name"
        />
        <Campo
          etiqueta="Email"
          value={valores.email}
          onChangeText={setValorDe('email')}
          error={errores.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <Campo
          etiqueta="Contraseña"
          value={valores.password}
          onChangeText={setValorDe('password')}
          error={errores.password}
          secureTextEntry
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
        />
        <Boton titulo="Crear cuenta" onPress={crearCuenta} cargando={enviando} />
        <Enlace onPress={() => navigation.replace('Login')}>¿Ya tenés cuenta? Iniciá sesión</Enlace>
      </Formulario>
    </PantallaScroll>
  );
}
