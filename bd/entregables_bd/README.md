# Entregables BD - Clone Twitter/X

Esta pasta contem uma primeira versao dos ficheiros para o projeto de SGBDI.

## Ficheiros

- `01_modelo_entidade_associacao.md`: modelo EA, modelo relacional, restricoes de integridade e exemplos de normalizacao.
- `02_script_criacao_bd.sql`: script MySQL para criar a base de dados e todas as tabelas.
- `03_queries_crud.txt`: queries CRUD documentadas para inserir, consultar, atualizar e apagar dados.
- `04_diagrama_ea.png`: imagem base do diagrama EA para usar como referencia visual.

## Como usar

1. Abrir o MySQL Workbench.
2. Executar o ficheiro `02_script_criacao_bd.sql`.
3. Usar o menu Database > Reverse Engineer para gerar o desenho fisico a partir da BD criada.
4. Guardar o modelo como ficheiro `.mwb`.
5. Exportar a imagem do diagrama em JPG ou PNG.
6. Executar/adaptar as queries do ficheiro `03_queries_crud.txt`.

## Nota

O ficheiro `.mwb` deve ser gerado no MySQL Workbench a partir do script SQL, porque e o formato nativo da ferramenta. O script ja contem as chaves primarias, chaves estrangeiras, indices e restricoes necessarias para o Workbench desenhar as relacoes.
