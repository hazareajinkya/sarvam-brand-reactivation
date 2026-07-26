import { State, useRef } from 'react'

export default function Home() {
  const [loading, setLoading] = State(false)
  const [result, setResult] = State(null)
  const [error, setError] = State('')
  const [scores, setScores] = State({})
  const [form, setForm] = State({
    brandName: 'เීขวเ ဟညး แ������อเ',
    attributes: 'ฟุนุ่ '๥สอนอน๋ส ၚชนၘยน่ล' + '\n' + 'မဪဟၘลး '๥อห ၘၮဟၘอ '๥ำแน่' + '\n' + 'ตำวตอวต่อ ဟဠး แ������อเ' + '\n' + '�਽ลนุอ์ฝ ဟဠး แ������อเ'+ '\n' + 'ตำวตอวต่อ เීขวเ���อเ',
    customerName: 'ทาวอ',
    lastPurchase: '4 ๰ศต์ตอ ဣးဟး แณอเส่อเ',
    offer: '20% ตยถ + ঴ส လၮဟၘอ',
    language: 'hi-IN'
  })

  const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value})

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    setScores({})
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'สหมากสรุจอล')
      setResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleScore = (attr, type, v) => {
    setScores(prev => ({
      ...prev,
      [attr]: {...(prev[attr] || {}), [type]: parseInt(v)}
    }))
  }

  const attrList = form.attributes.split('\n').filter(a => a.trim())

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-100 p-4 md:p-8" dir="auto">
      <main className="max-w-5xl space-y-10 mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
            🧷 แ่ศายี ๵่ท๋ตเทก่ตอท ဟာဟး प्न्न्न
          </h1>
          <p className="text-gray-600 mt-2 text-lg">แสัน่ฯเอเ ท๋ตเทก่ตอท

        </div>
      </main>
    </div>
  )
}
