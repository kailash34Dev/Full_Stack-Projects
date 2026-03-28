exports.capitalizeWords = (str) => {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

exports.capitalizePara = (str = "") => {
  return str
    .toLowerCase()
    .split(".")
    .map((sentence) => {
      sentence = sentence.trim();
      if (!sentence) return "";
      return sentence.charAt(0).toUpperCase() + sentence.slice(1);
    })
    .join(". ");
};
