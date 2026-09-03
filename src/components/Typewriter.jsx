import React, { useEffect, useState } from "react";

/**
 * Types out the given words one character at a time.
 * Each word can carry its own className (used for the blue "Projects!").
 */
export default function Typewriter({ words, speed = 70 }) {
  const fullText = words.map((w) => w.text).join(" ");
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (count >= fullText.length) return;
    const id = setTimeout(() => setCount((c) => c + 1), speed);
    return () => clearTimeout(id);
  }, [count, fullText.length, speed]);

  let typed = count;

  return (
    <h1 className="typewriter">
      {words.map((word, i) => {
        const chunk = i === 0 ? word.text : " " + word.text;
        const visible = chunk.slice(0, Math.max(0, typed));
        typed -= chunk.length;
        return (
          <span key={i} className={word.className}>
            {visible}
          </span>
        );
      })}
      <span className="cursor" />
    </h1>
  );
}
