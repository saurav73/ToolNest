import React, { useEffect, useRef, useState } from 'react';
import ToolLayout from '../../components/ToolLayout.jsx';

const FAQS = [
  {
    q: 'Which voices can I choose from?',
    a: 'The voices come from your own device and browser, not from ToolNest. Windows, macOS, Android and iOS each ship their own set, and browsers like Chrome add Google voices on top. If the list looks short, try a different browser or check your device\'s speech settings to install more voices.',
  },
  {
    q: 'Why does the speech stop partway through long text?',
    a: 'Some browsers pause or cut off very long utterances, a known quirk of the Web Speech API, especially in Chrome with remote voices. Splitting your text into paragraphs and playing them one at a time works around it. On desktop Chrome, a page reload also restarts the speech engine cleanly.',
  },
  {
    q: 'Is my text sent to a server to be read?',
    a: 'It depends on the voice. Local voices, usually marked as default or offline, synthesize speech entirely on your device. Some enhanced voices in Chrome are network-based and send the text to Google for synthesis. Either way, ToolNest itself never receives, stores or logs your text; the request goes from your browser to the voice provider.',
  },
  {
    q: 'Can I download the audio as an MP3?',
    a: 'The Web Speech API does not offer an audio download, so this tool is for listening only: proofreading, language practice and accessibility. If you need an audio file, dedicated text-to-speech software can record system audio while this page plays.',
  },
];

const CONTENT = (
  <>
    <h2>Listen to your text read aloud</h2>
    <p>
      Paste any text, pick a voice, set the speed, and hear it read back. Listening
      is one of the best proofreading tricks there is: your ears catch repeated
      words, missing punctuation and awkward phrasing that your eyes slide over.
      It is also handy for language learners checking pronunciation, and for anyone
      who prefers listening to reading long documents.
    </p>
    <h2>Ways people use text to speech</h2>
    <ul>
      <li><strong>Proofreading</strong> essays, articles and emails before sending.</li>
      <li><strong>Studying:</strong> hearing notes and summaries while walking or driving.</li>
      <li><strong>Language practice:</strong> slow the rate to 0.7 or 0.8 and follow the pronunciation.</li>
      <li><strong>Accessibility:</strong> an easy listening option for any text on the web.</li>
    </ul>
    <h2>How text to speech works in your browser</h2>
    <p>
      This tool uses the Web Speech API built into modern browsers. When you press Speak, your text is wrapped into a speech request along with the voice, rate and pitch you selected, and handed to the speech engine on your device. That engine breaks the text into sentences and words, looks up how each word is usually pronounced in the chosen language, and builds the audio in small chunks as it plays, rather than rendering the whole file first. That is why playback starts almost instantly even for a long article. It is also why the voice list differs between devices: the tool can only offer the voices your operating system and browser have installed, and changing browser or phone can give you a completely different set to choose from.
    </p>
    <h2>A worked example: proofreading a short email</h2>
    <p>
      Paste in a 180 word email, which is about one minute of speech at the default rate of 1.0. Listen once without looking at the screen and note any sentence you have to mentally replay. Then set the rate to 0.8, which stretches that email to roughly 75 seconds, and listen again while following the text. The slower pass surfaces problems the first pass missed: a doubled word such as the the, a missing comma that merges two ideas, or a sentence that runs to 35 words without a pause. Fix those spots, then do a final listen at 1.0 to confirm the email now flows at natural speed.
    </p>
    <h2>Practical tips for clearer playback</h2>
    <ul>
      <li><strong>Add punctuation before you listen:</strong> commas and full stops are the main signals the voice uses for pauses and intonation. A paragraph with no punctuation will be read in a flat rush, so a quick punctuation pass makes the output far easier to follow.</li>
      <li><strong>Break long text into sections:</strong> pasting one section at a time, such as one heading block from a report, gives you natural stopping points and avoids the long text cutoff that some browsers apply to very long requests.</li>
      <li><strong>Use pitch sparingly:</strong> a pitch near 1.0 sounds most natural. Lower values around 0.8 sound more serious for narration, while higher values suit character dialogue, but extreme settings quickly sound distorted.</li>
      <li><strong>Spell out tricky items:</strong> abbreviations, dates and figures are not always read the way you expect. If a date or a price matters, write it the way you want it heard for that one listen.</li>
      <li><strong>Pair listening with counting:</strong> after a proofreading listen, paste the same text into the <a href="/word-counter">Word Counter</a> to check length, or use the <a href="/character-counter">Character Counter</a> when a platform limits how much text a post can contain.</li>
    </ul>
    <h2>Common mistakes to avoid</h2>
    <ul>
      <li><strong>Judging a voice at the wrong speed:</strong> a voice that sounds rushed at 1.4 may sound warm and clear at 0.9. Test any new voice on the same short paragraph at two or three speeds before you decide it is not suitable.</li>
      <li><strong>Pasting formatted text full of symbols:</strong> tables, bullet symbols, URLs and footnote markers are often read out literally, which buries the actual content. Paste a clean, plain version of the text for listening, keeping your formatted original untouched.</li>
      <li><strong>Assuming every listener hears the same voice:</strong> a voice you name may not exist on another persons device. Describe the language and style you want instead of relying on one exact name.</li>
      <li><strong>Leaving playback running:</strong> closing or reloading the tab stops the speech engine, and pressing Speak again restarts from the beginning. Note where you stopped before you navigate away.</li>
      <li><strong>Using the wrong language voice for the text:</strong> an English voice reading French or Spanish text will apply English pronunciation throughout. Match the voice language to the text language for practice and proofreading, or the errors you hear will be the tools, not yours.</li>
    </ul>
  </>
);

export default function TextToSpeech() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [text, setText] = useState('');
  const [voices, setVoices] = useState([]);
  const [voiceUri, setVoiceUri] = useState('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [state, setState] = useState('idle'); // idle | speaking | paused
  const utterRef = useRef(null);

  useEffect(() => {
    if (!supported) return undefined;
    const load = () => {
      const list = window.speechSynthesis.getVoices();
      setVoices(list);
      if (list.length && !voiceUri) {
        const preferred = list.find((v) => v.lang && v.lang.startsWith('en') && v.default) || list.find((v) => v.lang && v.lang.startsWith('en')) || list[0];
        setVoiceUri(preferred ? preferred.voiceURI : '');
      }
    };
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load);
      window.speechSynthesis.cancel();
    };
  }, [supported, voiceUri]);

  const speak = () => {
    if (!supported || !text.trim()) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const voice = voices.find((v) => v.voiceURI === voiceUri);
    if (voice) utter.voice = voice;
    utter.rate = rate;
    utter.pitch = pitch;
    utter.onend = () => setState('idle');
    utter.onerror = () => setState('idle');
    utterRef.current = utter;
    setState('speaking');
    window.speechSynthesis.speak(utter);
  };

  const pauseResume = () => {
    if (!supported) return;
    if (state === 'speaking') {
      window.speechSynthesis.pause();
      setState('paused');
    } else if (state === 'paused') {
      window.speechSynthesis.resume();
      setState('speaking');
    }
  };

  const stop = () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setState('idle');
  };

  return (
    <ToolLayout
      slug="text-to-speech"
      path="/text-to-speech"
      title="Text to Speech: Read Any Text Aloud for Free | ToolNest"
      description="Listen to any text read aloud with your choice of voices and speed control. Free text to speech in your browser, great for proofreading."
      h1="Text to Speech"
      intro="Paste text and hear it read aloud with your choice of voice, speed and pitch. Perfect for proofreading, language practice and listening on the go."
      faqs={FAQS}
      content={CONTENT}
    >
      {!supported && (
        <div className="message err">Your browser does not support speech synthesis. Try Chrome, Edge or Safari for text to speech.</div>
      )}
      <div className="field">
        <label htmlFor="tts-in">Text to read aloud</label>
        <textarea
          id="tts-in"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the text you want to hear..."
          aria-label="Text to read aloud"
          autoFocus
        />
      </div>
      <div className="row">
        <div className="field">
          <label htmlFor="tts-voice">Voice</label>
          <select id="tts-voice" value={voiceUri} onChange={(e) => setVoiceUri(e.target.value)} disabled={!voices.length}>
            {voices.length === 0 && <option value="">Loading voices...</option>}
            {voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="tts-rate">Speed: {rate.toFixed(1)}x</label>
          <input id="tts-rate" type="range" min="0.5" max="2" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
        </div>
        <div className="field">
          <label htmlFor="tts-pitch">Pitch: {pitch.toFixed(1)}</label>
          <input id="tts-pitch" type="range" min="0" max="2" step="0.1" value={pitch} onChange={(e) => setPitch(Number(e.target.value))} />
        </div>
      </div>
      <div className="btn-row">
        <button type="button" className="btn" onClick={speak} disabled={!supported || !text.trim()}>Speak</button>
        <button type="button" className="btn secondary" onClick={pauseResume} disabled={state === 'idle'}>
          {state === 'paused' ? 'Resume' : 'Pause'}
        </button>
        <button type="button" className="btn ghost" onClick={stop} disabled={state === 'idle'}>Stop</button>
      </div>
      <p className="hint">Voices are provided by your device and browser, so the list differs between phones and computers.</p>
    </ToolLayout>
  );
}
