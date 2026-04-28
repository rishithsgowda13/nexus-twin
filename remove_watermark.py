import fitz

def remove_gamma_watermark():
    doc = fitz.open('Bengaluru-3D-Digital-Twin.pdf')
    for page in doc:
        links_to_delete = []
        for link in page.links():
            if 'gamma.app' in str(link):
                rect = link["from"]
                
                # Expand the rect slightly to make sure we cover the whole badge
                expanded_rect = fitz.Rect(rect.x0 - 5, rect.y0 - 5, rect.x1 + 5, rect.y1 + 5)
                
                # Sample background color just outside the rect
                sample_rect = fitz.Rect(expanded_rect.x0 - 5, expanded_rect.y0, expanded_rect.x0 - 4, expanded_rect.y0 + 1)
                pix = page.get_pixmap(clip=sample_rect)
                try:
                    r, g, b = pix.pixel(0, 0)
                    fill_color = (r/255, g/255, b/255)
                except:
                    fill_color = (1, 1, 1) # fallback to white
                
                # Redact the watermark area
                page.add_redact_annot(expanded_rect, fill=fill_color)
                links_to_delete.append(link)
                
        page.apply_redactions()
        
        # Remove the clickable link
        for link in links_to_delete:
            page.delete_link(link)

    doc.save('Bengaluru-3D-Digital-Twin-Clean.pdf')

if __name__ == '__main__':
    remove_gamma_watermark()
