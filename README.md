# Sunny Central

As a frequent user of parcel forwarders pre-covid(when shipping costs were not as high and overseas shipping options were not as limited), I found the whole process of purchasing products via that method a hassle. If the shop accepts international cards, I would be able able to purchase it myself. However, some retailers (like Ulta) which are country-specific, do not, so I would have to engage a middle man. More often than not, I thought to myself how nice it would be to have a retailer selling various exclusive products in one place.

As with project 2, skincare is a big passion of mine. Sunscreens are one of the products (or if not, the only one) that I am willing to drop my coins on. Having followed lots of up and coming skincare brands on social media, I am always envious of the people who live in those countries because they'll be able to purchase those products as soon as they land in stores. In Singapore, I'll have to play the waiting game and see if Sephora (finally) decides to bring them in locally.

And with that in mind, I have came up with Sunny Central, a third-party retailer who carries sunscreens that are exclusive and not accessible.

**As the shop owner, I want to:**
- make new sunscreen options accessible to everyone
- build engagement with the customers by allowing them to send in requests of brands that are hard to get in SG
- promote the importance of using sunscreens

**As the end user, I want to:**
- easily shop sunscreens that are as accessible to me
- stop getting FOMO so I take IG-worthy product shots too

Take a peak at the admin portal: [Sunny Central](https://nsy-03-sunscreen.herokuapp.com/login)
To log in as the admin(aka shop owner), use:
> **username:** teddy
> **password** burgers

To log in as the manager, use:
> **username:** jimmy
> **password** pasta


# UI/UX

As the admin, you have access to all pages and are able to add or remove employees.
As the manager, you are able to view everything except the employees section.
The employees icon/tab will appear depending on the role you signed in as.

The chosen colours are very self-explanatory – blue for the sky & sea and yellow for the sun.

[Here's](https://www.figma.com/file/QsHGWWdaYlQrsi3Zb0LeO0/sunny-central?node-id=0%3A1) the wireframes for the back & front end. I wanted the admin portal to have a dashboard feel to it so I've included a sidebar on the left. On the dashboard, there will be a quick display of how many products, customers, orders and enquiries there are so you'll be able to know everything at a glance.

Admins are allowed to add new brands and countries if the website catalog expands. Icons are used in most CTA buttons, to differentiate them froms other text (since tables can look a little cluttered). Information will be further collapsed once user is in mobile view.

The font used is [DM Sans](https://fonts.google.com/specimen/DM+Sans). It is a visually fun typeface.

# Features
## Major features & algorithsm
1. CRUD on products – edit product information and update stock.
2. Search products by name, brand, or status.
3. Search customers by username or email. Able to remove customer.
4. Update order information like status of order and tracking URL, which will be reflected on the Vue front end of the user's profile page.
5. Search orders by Order ID or shipping status.
6. Mark enquiries as read and search them by reason (easier for the person managing that e.g Product Request, Order cancellation, etc.)
7. Admin: Add and remove employees

# Technologies Used
1. Figma – used to create wireframes
2. Illustrator to create some icons
3. Fontawesome for the other icons
4. Express – set up the back end & make API routes for the front end cart to connect to
    - bookshelf ORM
    - caolan forms
    - Stripe
    - webtokens
    - webhooks
5. Heroku – used to host the back end

# Use & Test Cases:
1. Add, edit and remove product
2. Add employee
3. Update an order

# This site has been tested on:

# Credits
1. [Fontawesome](https://fontawesome.com/)
2. [Bookshelf documentation](https://bookshelfjs.org/index.html)
3. [Stack Overflow](https://stackoverflow.com/)