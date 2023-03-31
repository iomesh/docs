---
id: setup-worker-node
title: Set Up Worker Node
sidebar_label: Set Up Worker Node
---

After ensuring all requirements in [Prerequisites](#../) are met, you need to set up `open-iscsi` for each worker node.

1. On the node console, run the following command to install `open-iscsi`.

<!--DOCUSAURUS_CODE_TABS-->

<!--RHEL/CentOS-->

```shell
sudo yum install iscsi-initiator-utils -y
```

<!--Ubuntu-->

```shell
sudo apt-get install open-iscsi -y
```

<!--END_DOCUSAURUS_CODE_TABS-->

2. Edit `/etc/iscsi/iscsid.conf` by setting `node.startup` to `manual`.

    ```shell
    sudo sed -i 's/^node.startup = automatic$/node.startup = manual/' /etc/iscsi/iscsid.conf
    ```
    > **Note:**
    >
    > The value of `MaxRecvDataSegmentLength` in `/etc/iscsi/iscsi.conf` is set at 32,768 by default, and the maximum number of PVs is limited to 80,000 in IOMesh. To create PVs more than 80,000 in IOMesh, it is recommended to set the value of `MaxRecvDataSegmentLength` to 163,840 or above.
    
3. Disable SELinux.

    ```shell
    sudo setenforce 0
    sudo sed -i 's/^SELINUX=enforcing$/SELINUX=permissive/' /etc/selinux/config
    ```

4. Ensure `iscsi_tcp` kernel module is loaded.

    ```shell
    sudo modprobe iscsi_tcp
    sudo bash -c 'echo iscsi_tcp > /etc/modprobe.d/iscsi-tcp.conf'
    ```

5. Start `iscsid` service.

    ```shell
    sudo systemctl enable --now iscsid
    ```



