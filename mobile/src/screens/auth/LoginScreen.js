import { useAuth } from '../../context/AuthContext';
import { useFormulario } from '../../hooks/useFormulario';
import { Boton } from '../../components/Boton';
import { Campo } from '../../components/Campo';
import { AvisoError, Enlace, Formulario } from '../../components/Formulario';
import { PantallaScroll, TextoSecundario, Titulo } from '../../components/Textos';

export function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { valores, setValorDe, errores, error, enviando, enviar } = useFormulario({
    email: '',
    password: '',
  });

  const ingresar = async () => {
    const usuario = await enviar(({ email, password }) => login(email, password));
    if (usuario) {
      navigation.goBack(); // vuelve a la pantalla desde donde se pidió iniciar sesión
    }
  };

  return (
    <PantallaScroll keyboardShouldPersistTaps="handled">
      <Formulario>
        <Titulo>Bienvenido de nuevo</Titulo>
        <TextoSecundario>Ingresá para comprar entradas y seguir tus compras.</TextoSecundario>
        <AvisoError mensaje={error} />
        <Campo
          etiqueta="Email"
          value={valores.email}
          onChangeText={setValorDe('email')}
          error={errores.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          placeholder="tu@email.com"
        />
        <Campo
          etiqueta="Contraseña"
          value={valores.password}
          onChangeText={setValorDe('password')}
          error={errores.password}
          secureTextEntry
          autoComplete="password"
          onSubmitEditing={ingresar}
        />
        <Boton titulo="Ingresar" onPress={ingresar} cargando={enviando} />
        <Enlace onPress={() => navigation.replace('Registro')}>¿No tenés cuenta? Registrate</Enlace>
      </Formulario>
    </PantallaScroll>
  );
}
