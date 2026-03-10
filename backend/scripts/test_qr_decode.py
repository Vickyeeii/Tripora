import base64
from PIL import Image
import io
from pyzbar.pyzbar import decode

# PASTE ONLY THE qr_value STRING BELOW (NO JSON, NO QUOTES)
qr_base64 = """
iVBORw0KGgoAAAANSUhEUgAAAcIAAAHCAQAAAABUY/ToAAADnklEQVR4nO2cTW7jOBBGXw0FeEkBPoCPIt1gjtTIkeYG0lFygADk0gCFmgV/RDmNWTTasNxT30JI4jyYAj4Uq1glifJrWv/6RRCMNNJII4000kgjz0dK0VB+muMARBGIAzKzCcT6X/OLV2vkKclJVVUDqGqC9XYXkdGpzIAuOAWcqqrqkXzFao08JRlbfIkDqp8Duvi7sI6bAFv+VESGM6zWyDOTMuNU5JaQH58DTJoOznnGdxr53uQ3c6y3u+g6XxSiS7KOXyhxRIm/6zuN/DNJr6oLwBTKRWY20SVelLVlRqrpDKs18kxkiUOrAOCAeFWZ/sm/JpnCFZnCFWCTV6/WyDOS2UN9w8PfBfxddB0dwCYKdwF/bIu8130a+TySXK5Pqpq3sVzCB9gv+dMsX/5Zl/e6TyOfR1YP1aMhXTpfpXJwdPxbPiUyDxlZVRzhE0zBKfjUx6ZysljcxBTKQaN5yMim/ehZF1+jTy7T6iU7Z/F9lDIPGVlVz4f81yAwJFZxCmwDIChRAJ+AeMlek2l51WqNPCNZosreKptaUtTCUt7p8NrtdBaHjGzqcuUFyjammlANrm5y+YPUEeYhI5tqPuRK7tPn1CkHo710q/WbecjIR7L0MOIA0+dF9yar/AhQxokA/RjB5oeMPKqEmUM11o8THet9y4eM/K7iCFwt4WsCVJKimmcX+9j5kJGP2mt70fV2F6ZwTVJKfRD8F4BTIV6UdUb0das18oxk8dAUNqSbJooXFXyAPEmUtYmCq8Mf73WfRj6P7M+p+6QoHVOhuqFZv8zI79pz6pzslMyIVtY354QDYR4y8kiuI8js71IHQEDm+mxQaXPsbdlXr9bI05KrtGfJoAUep+DvIiIX1Y+xDTO+erVGnoV8nAuqptnnh1JX6tdOiO1lRnbSpmyf6TArVHawPInvtJN5yMgHMtaHEksCNKAft9bBr3HInlE08ifqQ1DYn4tu8i0iQcmpbZ7ayIP0qLKXVTfVGWtXx/ZtLzPy5+T+3g/W0al+3IqRWGVoc4wD/UNm73ifRj6D7Obv6xlj2bL6Rn3dwWrabXHIyE6HATPXV/nH5kaHmIeM/C8y5z6rDOhHvcgch1ah2Tm1kQ/6/t6PvwOC/yojHpNug64jeSiEKVyx2Q8jD2rzQwr57TBxSPkNeuT5oaBMYUQhIWDzQ0Y+6pDstFfmBdfP6be+fcm4LR8yspPYO86NNNJII4000sj/OfkvdC8/oLWs068AAAAASUVORK5CYII=
"""

# Clean whitespace/newlines
qr_base64 = qr_base64.strip()

# Decode base64 → image bytes
image_bytes = base64.b64decode(qr_base64)

# Load image
img = Image.open(io.BytesIO(image_bytes))

# Save for visual confirmation (optional but useful)
img.save("heritage_qr_test.png")

# Decode QR content
decoded = decode(img)

if not decoded:
    print("❌ QR could not be decoded")
else:
    for item in decoded:
        print("✅ QR decoded successfully")
        print("QR DATA:", item.data.decode("utf-8"))

