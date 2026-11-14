const FLOATING_TOKENS = [
  { text: 'const', tone: 'keyword', top: '9%', left: '5%', size: '0.78rem', delay: '0s', duration: '24s' },
  { text: '=>', tone: 'punct', top: '16%', left: '84%', size: '0.9rem', delay: '-6s', duration: '21s' },
  { text: 'async', tone: 'keyword', top: '27%', left: '91%', size: '0.68rem', delay: '-11s', duration: '27s' },
  { text: 'useState()', tone: 'function', top: '38%', left: '2%', size: '0.64rem', delay: '-4s', duration: '25s' },
  { text: "{ status: 'ok' }", tone: 'string', top: '48%', left: '86%', size: '0.61rem', delay: '-14s', duration: '29s' },
  { text: '</>', tone: 'accent', top: '57%', left: '6%', size: '0.85rem', delay: '-9s', duration: '23s' },
  { text: 'await', tone: 'keyword', top: '66%', left: '92%', size: '0.7rem', delay: '-2s', duration: '26s' },
  { text: 'SELECT *', tone: 'function', top: '77%', left: '3%', size: '0.6rem', delay: '-16s', duration: '28s' },
  { text: '01', tone: 'number', top: '86%', left: '88%', size: '0.78rem', delay: '-7s', duration: '22s' },
  { text: 'git push', tone: 'comment', top: '93%', left: '7%', size: '0.58rem', delay: '-12s', duration: '27s' },
  { text: 'AI', tone: 'accent', top: '34%', left: '7%', size: '0.72rem', delay: '-18s', duration: '24s' },
  { text: '#model', tone: 'comment', top: '72%', left: '83%', size: '0.58rem', delay: '-5s', duration: '25s' },
  { text: '[]', tone: 'punct', top: '21%', left: '3%', size: '0.9rem', delay: '-13s', duration: '20s' },
  { text: 'null', tone: 'keyword', top: '59%', left: '90%', size: '0.62rem', delay: '-3s', duration: '28s' },
  { text: '0x7F', tone: 'number', top: '44%', left: '93%', size: '0.58rem', delay: '-10s', duration: '23s' },
  { text: 'build()', tone: 'function', top: '83%', left: '4%', size: '0.62rem', delay: '-15s', duration: '26s' },
]

const SPLASH_TOKENS = [
  { text: 'const', tone: 'keyword', top: '14%', left: '8%', size: '0.8rem', delay: '0s', duration: '14s' },
  { text: '=>', tone: 'punct', top: '20%', left: '86%', size: '1rem', delay: '-3s', duration: '12s' },
  { text: 'async', tone: 'keyword', top: '31%', left: '91%', size: '0.68rem', delay: '-5s', duration: '16s' },
  { text: 'useEffect()', tone: 'function', top: '66%', left: '4%', size: '0.62rem', delay: '-2s', duration: '15s' },
  { text: "{ mode: 'ai' }", tone: 'string', top: '76%', left: '82%', size: '0.6rem', delay: '-7s', duration: '17s' },
  { text: '</>', tone: 'accent', top: '84%', left: '11%', size: '0.9rem', delay: '-4s', duration: '13s' },
  { text: 'npm run build', tone: 'comment', top: '10%', left: '64%', size: '0.58rem', delay: '-6s', duration: '16s' },
  { text: 'SELECT *', tone: 'function', top: '88%', left: '70%', size: '0.58rem', delay: '-1s', duration: '14s' },
]

function Token({ token, prefix }) {
  return (
    <span
      className={`${prefix}__token ${prefix}__token--${token.tone}`}
      style={{
        '--top': token.top,
        '--left': token.left,
        '--size': token.size,
        '--delay': token.delay,
        '--duration': token.duration,
      }}
    >
      {token.text}
    </span>
  )
}

export function CodeField() {
  return (
    <div className="code-field" aria-hidden="true">
      {FLOATING_TOKENS.map((token) => (
        <Token key={`${token.text}-${token.top}-${token.left}`} token={token} prefix="code-field" />
      ))}
    </div>
  )
}

export function SplashTokens() {
  return (
    <div className="splash__tokens" aria-hidden="true">
      {SPLASH_TOKENS.map((token) => (
        <Token key={`${token.text}-${token.top}-${token.left}`} token={token} prefix="splash" />
      ))}
    </div>
  )
}
