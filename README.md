# Sunny Central

As a frequent user of parcel forwarders pre-covid(when shipping costs were not as high and overseas shipping options were not as limited), I found the whole process of purchasing products via that method a hassle. If the shop accepts international cards, I would be able able to purchase it myself. However, some retailers (like Ulta, Mecca) which are country-specific, do not, so I would have to engage a middle man. More often than not, I thought to myself how nice it would be to have a retailer selling various exclusive products in one place.

As with project 2, skincare is a big passion of mine. Having followed lots of up-and-coming skincare brands on social media, I'm always envious of the people who live in those countries because they'll be able to purchase those products as soon as they land in stores. In Singapore(and everywhere else), we'll to have to play the waiting game and see if any major retailers decide to bring them in locally.

And with that in mind, I have came up with Sunny Central, a third-party retailer who brings in exclusive and not-so-accessible SPF products from all over the world to local customers.

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
> **password:** burgers

To log in as the manager, use:
> **username:** jimmy
> **password:** pasta


# UI/UX

As the admin, you have access to all pages and are able to add or remove employees.
As the manager, you are able to view everything except the employees section.
The employees icon/tab will appear depending on the role you signed in as.

The chosen colours are very self-explanatory – blue for the sky & sea and yellow for the sun.

[Here's](https://www.figma.com/file/QsHGWWdaYlQrsi3Zb0LeO0/sunny-central?node-id=0%3A1) the wireframes for the back & front end. I wanted the admin portal to have a dashboard feel to it so I've included a sidebar on the left. On the dashboard, there will be a quick display of how many products, customers, orders and enquiries there are so you'll be able to know everything at a glance.

Admins are allowed to add new brands and countries if the website catalog expands. Icons are used in most CTA buttons, to differentiate them froms other text (since tables can look a little cluttered). Information will be further collapsed once user is in mobile view.

The font used is [DM Sans](https://fonts.google.com/specimen/DM+Sans). It is a visually fun typeface.

# Features
## Major features & algorithm
1. CRUD on products – edit product information and update stock.
2. Product stock will be automatically updated/deducted upon every successful checkout from the front end shop.
3. Search products by name, brand, or status.
4. Search customers by username or email. Able to remove customer.
5. Update order information like status of order and tracking URL, which will be reflected on the Vue front end of the user's profile page.
6. Search orders by Order ID or shipping status.
7. Mark enquiries as read and search them by reason (easier for the person managing that e.g Product Request, Order cancellation, etc.)
8. Admin: Add and remove employees

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
1. Log in
2. Add, edit and remove product
3. Add, edit and remove brands, countries
4. Update an order
5. Receive and mark enquiries as read
6. [ADMINS ONLY] Add/remove employee

## Log in
| Description | Expected Results |
| ----------- | ---------------- |
| Fill in the username & password fields and click log in | If user is not found in database, an error message will appear <br><br> If user is found, you will directed to the dashboard. The badge next to the username at the top right will reflect the Admin or Manager role |

## Adding a product
| Description | Expected Results |
| ----------- | ---------------- |
| Go to the products page either by clicking the Products tab on the sidebar or Projects badge on the Dashboard | You will see all the sunscreens |
| Click on "Add new sunscreen" | The upload form will be displayed |
| Fill in all fields | If there are any errors or fields are left empty, the appropriate validation messages will appear |
| Once done, click on "Add product" | If there are no errors, product will be added to the database and the page will be redirected to the products page |

## Adding,Editing & Removing Brands and Countries

To expand the website catalog (& to ease the search process) you'll have to manually add the new brand & country it's imported from. 

| Description | Expected Results |
| ----------- | ---------------- |
| Go to the Brands/Countries page by clicking on the respective badges on the Products page | You will see the list of brands/countries |
| Click on "Add New Brand/Country" | You will have to input the Brand/Country. Field cannot be left empty |
| In the case of spelling errors, click on "Edit". Afterwards, click on Update | Once done, brand/country name will be updated in the database |
| Click on "Delete" for the brand/country you want to remove | You will be directed to a page that asks you if you want to remove it |
| Click Yes or No | If you click Yes, brand/country will be removed from database. If No, you will be directed back to the main Brands/Countries page |

## Editing a product info
| Description | Expected Results |
| ----------- | ---------------- |
| Use the search form to find the product | The name search is case sensitive, so make sure to capitilise the first letter of every word |
| Click on the Edit button | Form with all the information stored will be displayed |
| When editing the fields, make sure to update if there's enough stock or out of stock so user will/will not be able to add products to cart. Once done, click "Update Product Info" | If there are no errors, product will be added to the database and the page will be redirected to the products page |

## Deleting a product
| Description | Expected Results |
| ----------- | ---------------- |
| Use the search form to find the product | The name search is case sensitive, so make sure to capitilise the first letter of every word |
| Click on "Delete" for the product in the table you want to remove | You will be directed to a page that asks you if you want to remove it |
| Click Yes or No | If you click Yes, product will be removed from database. If No, you will be directed back to the main products page |

## Updating an order status
| Description | Expected Results |
| ----------- | ---------------- |
| Go to the orders page either by clicking the Orders tab on the sidebar or Orders badge on the Dashboard | You will see all the orders from newest to oldest |
| Use the search form to find the order you want to update | Order ID only takes in integers, Shipping allows you to see all orders that are under the same status |
| Click on the Update icon | You will see a form that allows you to update the order status and tracking URL (once the order has been shipped out) |
| Click Update | Once done, the user will be able to see the updated status & tracking URL from the front end in their profile page under the Orders tab |

## Receive and mark enquiries as read
| Description | Expected Results |
| ----------- | ---------------- |
| Go to the Enquiries page either by clicking the Enquiries tab on the sidebar or Enquiries badge on the Dashboard | You will see all the enquiries from newest to oldest |
| Filter through the list by using the search form. (Useful for carse where for e.g person A is in charge of order enquiries, person B is in charge of general enquiries) | Enquiries that fall under that reason will be shown.|
| Click on the "+" icon to view full message | Message will appear underneath the table row |
| Employee to reply the person via email. Mark "Replied" once done | You will be asked if you if you want to mark it as replied. If yes, enquiry will be moved to the replied enquiries database. |
| To view past enquiries that have been replied, click on the "Replied" tab | You will see a list of replied enquiries. |

## [ADMINS ONLY] Adding a newcomer
| Description | Expected Results |
| ----------- | ---------------- |
| Go to the Employees page by clicking the Employees tab on the sidebar | A list of employees & relevant information will be displayed |
| Click on 'Add a new employee' | You will see the form |
| Choose the role you want to assign to the newcomer and fill in all fields. Once done, click on Make Account  | If there are no errors, user will be added to the database and the page will be redirected to the Employees page  |

## [ADMINS ONLY] Removing an employee
| Description | Expected Results |
| ----------- | ---------------- |
| Go to the Employees page by clicking the Employees tab on the sidebar | A list of employees & relevant information will be displayed |
| Click on Remove | You will be directed to a page that asks if you want to remove the user |
| Click Yes or No | If you click Yes, employee will removed from database. If No, you will be directed back to the main employees page |


# This site has been tested on:

# Credits
1. [Fontawesome](https://fontawesome.com/)
2. [Bookshelf documentation](https://bookshelfjs.org/index.html)
3. [Stripe API documentation](https://stripe.com/docs/api)
4. [Stack Overflow](https://stackoverflow.com/)