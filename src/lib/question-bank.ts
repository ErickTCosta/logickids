export const QUESTION_BANK = [
  // MATEMÁTICA FÁCIL
  { text: 'João tinha 12 figurinhas. Ganhou mais 8 do amigo. Quantas ele tem agora?', emoji: '🃏', options: ['18','20','22','16'], correctIdx: 1, explanation: '12 + 8 = 20. Somamos porque João ganhou mais figurinhas!', category: 'matematica', difficulty: 'facil' },
  { text: 'Uma caixa tem 24 biscoitos. Dividindo igualmente entre 4 crianças, quantos cada um recebe?', emoji: '🍪', options: ['4','5','6','8'], correctIdx: 2, explanation: '24 ÷ 4 = 6. Dividimos em 4 partes iguais.', category: 'matematica', difficulty: 'facil' },
  { text: 'Ana tinha R$50. Gastou R$18 no lanche. Quanto sobrou?', emoji: '💰', options: ['R$28','R$30','R$32','R$22'], correctIdx: 2, explanation: '50 - 18 = 32. Subtraímos o que ela gastou.', category: 'matematica', difficulty: 'facil' },
  { text: 'Pedro tem 3 pacotes com 6 balas cada. Quantas balas no total?', emoji: '🍬', options: ['9','12','18','24'], correctIdx: 2, explanation: '3 × 6 = 18. Três grupos de seis.', category: 'matematica', difficulty: 'facil' },
  { text: 'Uma fileira tem 7 cadeiras. Quantas cadeiras em 5 fileiras?', emoji: '🪑', options: ['30','35','40','25'], correctIdx: 1, explanation: '7 × 5 = 35. Cinco grupos de sete.', category: 'matematica', difficulty: 'facil' },
  // MATEMÁTICA MÉDIO
  { text: 'Numa festa, cada criança come 3 fatias de pizza. Se há 8 crianças, quantas fatias no total?', emoji: '🍕', options: ['21','24','27','30'], correctIdx: 1, explanation: '8 × 3 = 24 fatias.', category: 'matematica', difficulty: 'medio' },
  { text: 'Carla percorre 15 km por dia de bicicleta. Em 6 dias, quantos km percorreu?', emoji: '🚴', options: ['80','85','90','95'], correctIdx: 2, explanation: '15 × 6 = 90 km.', category: 'matematica', difficulty: 'medio' },
  // SEQUÊNCIAS FÁCIL
  { text: 'Qual número vem a seguir? 2, 4, 6, 8, __', emoji: '🔢', options: ['9','10','12','11'], correctIdx: 1, explanation: 'Somamos 2 a cada número: 8 + 2 = 10!', category: 'sequencia', difficulty: 'facil' },
  { text: 'Continue a sequência: 3, 6, 9, 12, __', emoji: '📊', options: ['14','15','16','18'], correctIdx: 1, explanation: 'Pulamos de 3 em 3: 12 + 3 = 15.', category: 'sequencia', difficulty: 'facil' },
  { text: 'Que número vem a seguir? 100, 90, 80, 70, __', emoji: '⬇️', options: ['65','55','60','50'], correctIdx: 2, explanation: 'Subtraímos 10 a cada vez: 70 - 10 = 60.', category: 'sequencia', difficulty: 'facil' },
  { text: 'Próximo da sequência: 5, 10, 15, 20, __', emoji: '🏃', options: ['22','23','25','30'], correctIdx: 2, explanation: 'Somamos 5 a cada número: 20 + 5 = 25.', category: 'sequencia', difficulty: 'facil' },
  // SEQUÊNCIAS MÉDIO
  { text: 'Complete: 1, 2, 4, 8, __', emoji: '✖️', options: ['12','14','16','18'], correctIdx: 2, explanation: 'Multiplicamos por 2: 8 × 2 = 16!', category: 'sequencia', difficulty: 'medio' },
  { text: 'Qual é o próximo? 1, 4, 9, 16, __', emoji: '⬛', options: ['20','24','25','30'], correctIdx: 2, explanation: 'São quadrados perfeitos: 5² = 25.', category: 'sequencia', difficulty: 'medio' },
  // PADRÕES FÁCIL
  { text: 'Qual vem a seguir? 🔴 🔵 🔴 🔵 🔴 __', emoji: '', options: ['🔴','🔵','🟡','🟢'], correctIdx: 1, explanation: 'O padrão VERMELHO/AZUL se repete. Após vermelho vem azul!', category: 'padroes', difficulty: 'facil' },
  { text: 'Complete o padrão: 🌟 🌙 🌟 🌙 🌟 __', emoji: '', options: ['🌟','🌙','☀️','🌥️'], correctIdx: 1, explanation: 'Estrela e lua se alternam. Depois de estrela vem lua!', category: 'padroes', difficulty: 'facil' },
  { text: 'Próxima figura: ❤️ ❤️ 💛 ❤️ ❤️ 💛 __', emoji: '', options: ['💛','❤️','💚','💙'], correctIdx: 1, explanation: 'Padrão ❤️❤️💛 se repete. Após 💛 vem ❤️.', category: 'padroes', difficulty: 'facil' },
  // LÓGICA FÁCIL
  { text: 'Pedro é mais alto que João. João é mais alto que Maria. Quem é o mais baixo?', emoji: '👥', options: ['Pedro','João','Maria','Todos iguais'], correctIdx: 2, explanation: 'Maria < João < Pedro. Maria é a mais baixa!', category: 'logica', difficulty: 'facil' },
  { text: 'Todos os gatos têm 4 patas. Mingau é um gato. Quantas patas Mingau tem?', emoji: '🐱', options: ['2','3','4','5'], correctIdx: 2, explanation: 'Se todos os gatos têm 4 patas e Mingau é gato, ele tem 4!', category: 'logica', difficulty: 'facil' },
  { text: 'Se chove, a rua fica molhada. A rua está seca. O que podemos concluir?', emoji: '🌧️', options: ['Está chovendo','Não está chovendo','Vai chover','Não sabemos'], correctIdx: 1, explanation: 'Rua seca = não choveu!', category: 'logica', difficulty: 'facil' },
  // ROBÔ FÁCIL
  { text: 'O robô anda 1 passo frente, depois 1 passo trás. Após 4 movimentos, onde está?', emoji: '🤖', options: ['2 passos à frente','No mesmo lugar','1 passo atrás','4 passos à frente'], correctIdx: 1, explanation: '1 frente + 1 trás = 0. Após 4 movimentos ele fica no mesmo lugar!', category: 'robo', difficulty: 'facil' },
  { text: 'Sequência: ➡️ ➡️ ⬆️ ⬆️ ➡️. Quantos passos para a direita?', emoji: '🏫', options: ['2','3','4','5'], correctIdx: 1, explanation: 'Contamos as setas ➡️: são 3 passos para a direita.', category: 'robo', difficulty: 'facil' },
  // ESPACIAL FÁCIL
  { text: 'Uma figura tem 4 lados iguais e 4 ângulos retos. O que ela é?', emoji: '🟦', options: ['Triângulo','Retângulo','Quadrado','Círculo'], correctIdx: 2, explanation: '4 lados iguais + 4 ângulos retos = quadrado!', category: 'espacial', difficulty: 'facil' },
  { text: 'Quantas faces tem um cubo?', emoji: '🎲', options: ['4','5','6','8'], correctIdx: 2, explanation: 'Um cubo tem 6 faces: topo, fundo, frente, trás, esquerda, direita.', category: 'espacial', difficulty: 'facil' },
  { text: 'Uma pizza foi cortada em 8 fatias iguais. Comi 3. Que fração sobrou?', emoji: '🍕', options: ['3/8','5/8','4/8','6/8'], correctIdx: 1, explanation: '8 - 3 = 5 fatias. Sobrou 5/8 da pizza.', category: 'espacial', difficulty: 'facil' },
]
