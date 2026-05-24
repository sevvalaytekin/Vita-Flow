# VitaFlow – Akış Senaryosu

## 1. Giriş Ekranı (1login.png)

- Kullanıcı e-posta ve şifresini girerek **Giriş Yap** butonuna tıklar.
- Kullanıcı şifresini unutursa **Şifremi Unuttum** butonuna tıklar.
- Kullanıcı, telefon numarasına gelen SMS doğrulama kodu ile şifresini değiştirebilir.

---

## 2. Kayıt Ol Ekranı (2Register.png)

- Kullanıcı gerekli bilgileri doldurur.
- Öncelik durumunu seçer:
  - Doktorun belirlediği öncelik
  - Kronik hastalar
  - 65 yaş üstü
  - Engelliler
- Kullanıcı KVKK ve kullanım şartlarını kabul ederse **Kayıt Ol** butonuna basarak kayıt işlemini tamamlar.
- Kayıt tamamlandıktan sonra kullanıcı tekrar 1login.png ekranına yönlendirilir ve giriş yapabilir.

---

## 3. Acil Servisler Sayfası (3au.png)

Kullanıcı giriş yaptıktan sonra sistem tarafından **Acil Servisler** sayfasına yönlendirilir.

### Konum Alma

Kullanıcının konumu alınır:

- GPS
- Adres bilgisi

### Sistem İşleyişi

Sistem belirlenen alan içerisindeki acil servisleri listeler.

Her acil servis için aşağıdaki bilgiler gösterilir:

- Toplam kapasite
- Boş kapasite *(Örnek: 25 kapasite → 12 boş)*
- Mesafe (km)
- Trafik süresi (dakika)
- Kullanıcının priority durumu

Sistem tüm verileri skorlayarak kullanıcıya en uygun acil servisi önerir.

### Acile Kayıt Olma

Kullanıcı önerilen acil servisi kabul ederse **Acile Kayıt Ol** butonuna tıklar.

Sistem:

- "Acil Girişi" kaydı oluşturur.
- Kullanıcıya sıra numarası atar.
- Tahmini bekleme süresini gösterir.

---

## 4. Randevu Sistemi (4randevular.png)

Kullanıcı acil servis yerine randevu almak isterse 3au.png ekranındaki panelden **Randevular** bölümüne tıklar ve 4randevular.png sayfasına yönlendirilir.

---

## 5. İptal Edilen Randevu Sistemi

Eğer kullanıcılardan biri randevusunu iptal ederse:

### Sistem İşleyişi

Sistem, aynı poliklinik/doktor için gelecekte randevusu bulunan kullanıcıları öncelik kuralına göre listeler.

### Öncelik Sırası

- Doktorun belirlediği öncelik
- Kronik hastalar
- 65 yaş üstü
- Engelliler

- Öncelikli hastalara 24 saat boyunca öncelik tanınır.
- Bu liste, randevu sistemi altında bulunan **İptal Edilen Randevular** bölümünde gösterilir.
- Kullanıcı **Randevuyu Al** butonuna basarsa randevu kendisine atanır.

### Bildirim Sistemi

Sistem yalnızca:

- İptal edilen randevu saatinden sonraya randevusu bulunan kullanıcılara bildirim gönderir.

Bildirim alan kullanıcıya:

> "Bu randevuyu almak ister misiniz?"

şeklinde aksiyon sunulur.

### İlk Gelen Kazanır Sistemi

- İlk onaylayan kullanıcı randevuyu alır.
- Diğer kullanıcılara "Dolu" bilgisi gönderilir.

### 24 Saat Sonunda

Eğer 24 saat içinde öncelikli hastalar tarafından randevu alınmazsa:

- Slot **Açık Randevular** listesine düşer.
- Tüm kullanıcılara görünür olur.
- Açık randevular kısmında gösterilir.

---

## 6. Yeni Randevu Alma

Kullanıcı **Yeni Randevu** butonuna basar.

### Kullanıcı İşlemleri

- Gitmek istediği branşı / polikliniği seçer.
- Opsiyonel olarak doktor ismi girer.

### Sistem İşleyişi

Sistem:

- İlgili branşları, poliklinikleri ve doktorları listeler.

Her poliklinik için:

- Uygun randevu slot sayısı
- Mesafe ve trafik bilgisi
- Doktor ismi ve yoğunluğu
- Kullanıcının tercih ettiği hastaneler

gösterilir.

Sistem optimizasyon sonrası sıralı öneri listesi sunar.

### Randevu Oluşturma

- Kullanıcı polikliniği ve saat slotunu seçer.
- Sistem randevuyu oluşturur.
- Kullanıcının takvimine ekleme yapılması önerilir *(opsiyonel entegrasyon)*.

---

## 7. Randevularım

Kullanıcı soldaki panelden **Randevularım** bölümüne tıkladığında:

- Aldığı tüm randevular görüntülenir.

---

## 8. Profilim Sayfası

Kullanıcı soldaki panelden **Profilim** bölümüne tıklar.

Bu sayfada kullanıcı:

- Kişisel bilgilerini düzenleyebilir.
- Öncelik durumunu değiştirebilir.
- Bildirim ayarlarını düzenleyebilir.

### Hastane Tercihleri

- Kullanıcı **Hastane Ekle** butonuna basarak tercih ettiği hastaneleri ekleyebilir.

### Tıbbi Geçmiş

- Hastanın daha önce aldığı randevular görüntülenir.

### Kullanım İstatistikleri

Sayfanın alt kısmında kullanıcının:

- Randevu sayıları
- İptal oranları
- Acil başvuru geçmişi
- Sistem kullanım istatistikleri

gösterilir.
