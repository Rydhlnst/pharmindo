import sys

def fix_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace the mojibake
    content = content.replace('ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢', '•')
    content = content.replace('ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ', '—')
    content = content.replace('ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬', '-')

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

fix_file('apps/web/components/admin/AdminTopbar.tsx')
print("Done!")
