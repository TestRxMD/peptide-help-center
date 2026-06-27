#!/bin/bash
# Double-click to publish the Library + Short Proteins removal to your live site.
# Commits ONLY the intended files, then pushes -> Vercel auto-builds & deploys.
# Your homepage is safe: if the build fails, Vercel keeps the current site live.

cd "/Users/jnieters/Desktop/phc-deploy" || {
  echo "Could not find the phc-deploy folder."; read -n 1 -s -r -p "Press any key to close."; exit 1; }

echo "==================================================="
echo "   Publishing -> www.peptidehelpcenter.com"
echo "==================================================="
echo

# Clear any stale git lock left by tooling (safe for single-user use)
[ -f .git/index.lock ] && rm -f .git/index.lock && echo "(cleared a stale git lock)"

echo "Staging the changes..."
git add \
  src/components/Footer.tsx \
  src/components/Navigation.tsx \
  src/components/PeptideModal.tsx \
  src/pages/AIPage.tsx \
  src/pages/GuidePage.tsx \
  src/pages/WikiPage.tsx \
  vercel.json \
  public/library/index.html

echo
echo "Committing these:"
git status --short
echo
git commit -m "Add Library (/library) + nav button; remove Short Proteins sourcing"
echo
echo "Pushing to GitHub (this triggers the Vercel deploy)..."
git push
echo
echo "---------------------------------------------------"
echo "Pushed. Vercel is building now (~1-2 min). Then check:"
echo "  - Homepage looks normal:        https://www.peptidehelpcenter.com"
echo "  - New Library button in the nav, opening:"
echo "                                  https://www.peptidehelpcenter.com/library"
echo "  - No 'Short Proteins' in the footer / peptide popups / guide / wiki / AI builder"
echo "---------------------------------------------------"
read -n 1 -s -r -p "Press any key to close this window."
echo
