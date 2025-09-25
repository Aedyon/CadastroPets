import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MaskInput, { Masks } from "react-native-mask-input";

// esquema de validação com yup
const schema = yup.object().shape({
  nome: yup.string().required("Nome é obrigatório"),
  email: yup
    .string()
    .email("E-mail inválido")
    .required("E-mail é obrigatório"),
  celular: yup
    .string()
    .matches(/^\(\d{2}\)\s\d{5}-\d{4}$/, "Celular inválido")
    .required("Celular é obrigatório"),
  dataNascimento: yup
    .string()
    .matches(
      /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(19|20)\d\d$/,
      "Data inválida"
    )
    .required("Data de Nascimento é obrigatória"),
  senha: yup
    .string()
    .min(6, "Senha deve ter ao menos 6 caracteres")
    .required("Senha é obrigatória"),
  confirmSenha: yup
    .string()
    .oneOf([yup.ref("senha"), null], "Senhas devem coincidir")
    .required("Confirmação de senha é obrigatória"),
  // preferências — obrigatórias
  especie: yup.string().oneOf(["Cachorro", "Gato"]).required(),
  sexo: yup.string().oneOf(["Macho", "Fêmea"]).required(),
  idade: yup.string().oneOf(["Filhote", "Adulto", "Idoso"]).required(),
  porte: yup.string().oneOf(["Pequeno", "Médio", "Grande"]).required(),
});

export default function CadastroAdocao() {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: {
      nome: "",
      email: "",
      celular: "",
      dataNascimento: "",
      senha: "",
      confirmSenha: "",
      especie: "",
      sexo: "",
      idade: "",
      porte: "",
    },
  });

  const [verificandoEmail, setVerificandoEmail] = useState(false);

  const onSubmit = (data) => {
    // simula que enviamos dados para backend
    Alert.alert("Sucesso!", "Cadastro realizado com sucesso.\n" + JSON.stringify(data));
  };

  // simula verificação assíncrona de e-mail (ex: ver se já existe)
  const verificaEmail = async (email) => {
    setVerificandoEmail(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setVerificandoEmail(false);
        // vamos simular que “teste@teste.com” já existe
        if (email.toLowerCase() === "teste@teste.com") {
          resolve(false);
        } else {
          resolve(true);
        }
      }, 1500);
    });
  };

  // watcher pra ver quando email muda
  const emailValue = watch("email");

  React.useEffect(() => {
    if (emailValue && /\S+@\S+\.\S+/.test(emailValue)) {
      // chama verificação mock
      verificaEmail(emailValue).then((ok) => {
        if (!ok) {
          // podemos disparar um erro manualmente ou alert
          Alert.alert("E-mail já cadastrado");
        }
      });
    }
  }, [emailValue]);

  const opcoes = (fieldName, optionsArray, control) => {
    // componente para seleção de uma opção única
    return (
      <Controller
        control={control}
        name={fieldName}
        render={({ field: { value, onChange } }) => {
          return (
            <View style={styles.selectionRow}>
              {optionsArray.map((opt) => {
                const selecionado = value === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.chip,
                      selecionado && styles.chipSelecionado,
                    ]}
                    onPress={() => onChange(opt)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selecionado && styles.chipTextSelecionado,
                      ]}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        }}
      />
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Seus Dados</Text>

      <Controller
        control={control}
        name="nome"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputGroup}>
            <Text>Nome Completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu nome"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
            {errors.nome && (
              <Text style={styles.errorText}>{errors.nome.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputGroup}>
            <Text>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="nome@exemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
            {verificandoEmail && <Text>Verificando e-mail…</Text>}
            {errors.email && (
              <Text style={styles.errorText}>{errors.email.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="celular"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputGroup}>
            <Text>Celular</Text>
            <MaskInput
              style={styles.input}
              placeholder="(99) 99999-9999"
              keyboardType="phone-pad"
              value={value}
              onBlur={onBlur}
              onChangeText={(masked, unmasked) => {
                onChange(masked);
              }}
              mask={Masks.BRL_PHONE}
            />
            {errors.celular && (
              <Text style={styles.errorText}>{errors.celular.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="dataNascimento"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputGroup}>
            <Text>Data de Nascimento</Text>
            <MaskInput
              style={styles.input}
              placeholder="DD/MM/AAAA"
              keyboardType="numeric"
              value={value}
              onBlur={onBlur}
              onChangeText={(masked, unmasked) => {
                onChange(masked);
              }}
              mask={[
                /\d/,
                /\d/,
                "/",
                /\d/,
                /\d/,
                "/",
                /\d/,
                /\d/,
                /\d/,
                /\d/,
              ]}
            />
            {errors.dataNascimento && (
              <Text style={styles.errorText}>
                {errors.dataNascimento.message}
              </Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="senha"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputGroup}>
            <Text>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Senha"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
            {errors.senha && (
              <Text style={styles.errorText}>{errors.senha.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="confirmSenha"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputGroup}>
            <Text>Confirmar Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirme a senha"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
            {errors.confirmSenha && (
              <Text style={styles.errorText}>
                {errors.confirmSenha.message}
              </Text>
            )}
          </View>
        )}
      />

      <Text style={[styles.titulo, { marginTop: 30 }]}>
        Preferências para Adoção
      </Text>

      <Text>Espécie</Text>
      {opcoes("especie", ["Cachorro", "Gato"], control)}
      {errors.especie && (
        <Text style={styles.errorText}>Escolha a espécie</Text>
      )}

      <Text>Sexo</Text>
      {opcoes("sexo", ["Macho", "Fêmea"], control)}
      {errors.sexo && <Text style={styles.errorText}>Escolha o sexo</Text>}

      <Text>Idade</Text>
      {opcoes("idade", ["Filhote", "Adulto", "Idoso"], control)}
      {errors.idade && <Text style={styles.errorText}>Escolha a idade</Text>}

      <Text>Porte</Text>
      {opcoes("porte", ["Pequeno", "Médio", "Grande"], control)}
      {errors.porte && <Text style={styles.errorText}>Escolha o porte</Text>}

      <TouchableOpacity
        style={[
          styles.submitBtn,
          { backgroundColor: isValid ? "#4CAF50" : "#A5D6A7" },
        ]}
        disabled={!isValid}
        onPress={handleSubmit(onSubmit)}
      >
        <Text style={styles.submitText}>Quero Adotar!</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#FFF8E1",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#6D4C41",
  },
  inputGroup: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#BDBDBD",
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
    backgroundColor: "#FFFFFF",
  },
  errorText: {
    color: "#D32F2F",
    marginTop: 5,
  },
  selectionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 10,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#BDBDBD",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  chipSelecionado: {
    backgroundColor: "#A1887F",
    borderColor: "#6D4C41",
  },
  chipText: {
    color: "#6D4C41",
    fontSize: 16,
  },
  chipTextSelecionado: {
    color: "#FFF",
    fontWeight: "bold",
  },
  submitBtn: {
    marginTop: 30,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  submitText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
