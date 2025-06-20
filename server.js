const express = require('express')
const multer = require('multer')
const csv = require('csv-parser')
const { Readable } = require('stream')

const app = express()
const port = 3000 // A porta em que nosso servidor Node irá rodar

// Configura o multer para processar os uploads em memória
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// Rota para servir a página HTML principal
app.get('/', (req, res) => {
  // Envia o arquivo index.html quando alguém acessa a raiz do site
  res.sendFile(__dirname + '/index.html')
})

// Rota para a análise, que aceita os dois arquivos
app.post('/analyze', upload.fields([{ name: 'ga4File' }, { name: 'floodlightFile' }]), (req, res) => {
  // Verifica se os arquivos foram enviados
  if (!req.files || !req.files.ga4File || !req.files.floodlightFile) {
    return res.status(400).json({ error: 'Por favor, envie ambos os arquivos CSV.' })
  }

  const ga4Buffer = req.files.ga4File[0].buffer
  const floodlightBuffer = req.files.floodlightFile[0].buffer

  const ga4Transactions = new Map()
  const floodTransactions = new Map()

  // Promises para saber quando cada arquivo terminou de ser lido
  const p1 = new Promise(resolve => {
    Readable.from(ga4Buffer)
      .pipe(
        csv({
          mapHeaders: ({ header, index }) => {
            if (header.match(/transaction.?Id/i) || index === 0) return 'id'
            if (header.match(/revenue/i) || index === 1) return 'revenue'
            return null // Ignora outras colunas
          },
        })
      )
      .on('data', row => {
        if (row.id && row.revenue) {
          ga4Transactions.set(row.id, parseFloat(row.revenue) || 0)
        }
      })
      .on('end', resolve)
  })

  const p2 = new Promise(resolve => {
    Readable.from(floodlightBuffer)
      .pipe(
        csv({
          mapHeaders: ({ header, index }) => {
            if (header.match(/transaction.?id|id/i) || index === 0) return 'id'
            if (header.match(/revenue/i) || index === 1) return 'revenue'
            return null // Ignora outras colunas
          },
        })
      )
      .on('data', row => {
        if (row.id && row.revenue) {
          floodTransactions.set(row.id, parseFloat(row.revenue) || 0)
        }
      })
      .on('end', resolve)
  })

  // Quando ambos os arquivos forem processados, executa a análise
  Promise.all([p1, p2]).then(() => {
    const onlyGa4Transactions = new Map()
    const onlyFloodTransactions = new Map()
    const bothTransactions = new Map()

    for (const [id, revenue] of ga4Transactions.entries()) {
      if (floodTransactions.has(id)) {
        bothTransactions.set(id, revenue)
        // Remove do flood para que depois sobrem apenas os exclusivos
        floodTransactions.delete(id)
      } else {
        onlyGa4Transactions.set(id, revenue)
      }
    }

    // O que sobrou em floodTransactions é exclusivo dele
    for (const [id, revenue] of floodTransactions.entries()) {
      onlyFloodTransactions.set(id, revenue)
    }

    // Função para somar a receita de um Map
    const sumRevenue = transactionsMap =>
      Array.from(transactionsMap.values()).reduce((acc, current) => acc + current, 0)

    // Monta o objeto de resultado para enviar como JSON
    const results = {
      both: {
        count: bothTransactions.size,
        revenue: sumRevenue(bothTransactions),
      },
      onlyGa4: {
        count: onlyGa4Transactions.size,
        revenue: sumRevenue(onlyGa4Transactions),
      },
      onlyFloodlight: {
        count: onlyFloodTransactions.size,
        revenue: sumRevenue(onlyFloodTransactions),
      },
    }

    res.json(results)
  })
})

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`)
})
