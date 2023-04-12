---
id: external-storage
title: External Storage outside Kubernetes
sidebar_label: External Storage outside Kubernetes
---


## Configure iSCSI Access Point

To ensure high availability and a stable IP address for the iSCSI service access point, IOMesh employs a LoadBalancer type service, `iomesh-access`, to access iSCSI service.

The `iomesh-access` service needs to have an external IP, and the way to configure the IP depends on the cloud environment where IOMesh is deployed.

- When IOMesh is deployed in [cloud environments that supports LoadBalancer](https://kubernetes.io/docs/concepts/services-networking/service/#internal-load-balancer), refer to **In-Tree LoadBalancer**. 
- If IOMesh is deployed on bare metal or other cloud environments that do not support LoadBalancer, refer to **Out-of-Tree LoadBalancer**.

<!--DOCUSAURUS_CODE_TABS-->

<!--In-Tree LoadBalancer-->

Kubernetes will automatically call API of the cloud provider and assign an external IP to `iomesh-access` service as the entry point for the LoadBalancer.

1. Check the status of `iomesh-access` service, ensuring an external IP has been assigned to it.

    ```bash
    kubectl get service iomesh-access -n iomesh-system
    ```
    ```output
    NAME            TYPE           CLUSTER-IP     EXTERNAL-IP     PORT(S)                                                          AGE
    iomesh-access   LoadBalancer   10.96.22.212   192.168.2.1     3260:32012/TCP,10206:31920/TCP,10201:31402/TCP,10207:31802/TCP   45h

2. Set `spec.redirector.iscsiVirtualIP` to the external IP for `iomesh-access` service. Once edited, the `iomesh-iscsi-redirector` pod will restart to make 

    > **_NOTE_:** `spec.redirector.iscsiVirtualIP` should be the same as the external IP of `iomesh-access` service. If the external IP is changed, update `spec.redirector.iscsiVi rtualIP`.

<!--Out-of-Tree LoadBalancer-->
If IOMesh is deployed in a bare metal or other cloud environments that do not support Kubernetes LoadBalancer, you need to install `MetallLB` as a default LocalBalancer in the Kubernetes cluster. 

1. Verify that the Kubernetes cluster meets the requirements of installing [ `MetalLB` ](https://metallb.universe.tf/installation/#preparation).

2. Install `MetalLB`.
    ```shell
    helm repo add metallb https://metallb.github.io/metallb
    helm install metallb metallb/metallb --version 0.12.1 -n iomesh-system
    ```
3. Create a `MetalLB` YAML configMap `metallb-config.yaml`. 

    Set `protocol` to `layer2`. Fill in an IP range in `addresses`. The IP pool must be an IP range like "192.168.1.100-192.168.1.110" or the subnet mask like "192.168.2.0/24".  

    ```yaml
    apiVersion: v1
    kind: ConfigMap
    metadata:
      namespace: iomesh-system
      name: metallb
    data:
      config: |
        address-pools:
        - name: iomesh-access-address-pools
          protocol: layer2
          addresses:
          - <fill-in-your-ip-address-pool-here> # Fill in an IP pool.
    ```
4. Apply the YAML config.
    ```shell
    kubectl apply -f metallb-config.yaml
    ```

5. Check the status of `iomesh-access` service, ensuring an external IP from the IP pool has been assigned to `MetalLB`.
    ```shell
    watch kubectl get service iomesh-access -n iomesh-system
    ```
    ```output
    NAME            TYPE           CLUSTER-IP     EXTERNAL-IP     PORT(S)                                                          AGE
    iomesh-access   LoadBalancer   10.96.22.212   192.168.2.1     3260:32012/TCP,10206:31920/TCP,10201:31402/TCP,10207:31802/TCP   45h
    ```
6. Run the following command to set `spec.redirector.iscsiVirtualIP` to the external IP of `iomesh-access` service. After the modification is saved, the `iomesh-iscsi-redirector` pod will be automatically restarted to make modifications effective.

    > **_NOTE_:** `spec.redirector.iscsiVirtualIP` should be the same as the external IP of `iomesh-access` service. If the external IP is changed, update `spec.redirector.iscsiVi rtualIP`.

<!--END_DOCUSAURUS_CODE_TABS-->

## IOMesh as iSCSI Target

IOMesh provides support for the external iSCSI access service. You can create an iSCSI LUN by creating a PVC that can be accessed via any iSCSI client such as `open-iscsi` located beyond the Kubernetes cluster.

> **_NOTE_**: This function requires the iSCSI client to be able to access the `DATA_CIDR` segment that was configured during IOMesh installation.

### Create iSCSI LUN using PVC

Create a YAML config

1. Create an external iSCSI LUN using PVC. You may obtain the iSCSI client IQNs by using the command `cat /etc/iscsi/initiatorname.iscsi`.
    ```yaml
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: external-iscsi
      annotations:
        # Mark this PVC as a LUN for external use.
        iomesh.com/external-use: "true"
        # Set `initiator iqn acl` for LUN. If left unspecified, all initiators will be prohibited from accessing this PVC.
        # If `accessModes` is `RWO`, you can only set 1 value in this field.
        # If `accessModes` is `RWX`, you can set multiple values in this field and separate them with the comma (,).
        # To allow all IQNs to access this PVC, set the value to "*/*".
        iomesh.com/iscsi-lun-iqn-allow-list: "iqn.1994-05.com.example:a6c97f775dcb"
    spec:
      storageClassName: iomesh-csi-driver
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 1Gi
    ```
    > **_NOTE_**: You also set the field `iomesh.com/iscsi-lun-iqn-allow-list` after the PVC is created.

2. Once the PVC transitions to `Bound` state, run the following command to view the field `spec.volumeAttributes.iscsiEntrypoint`.
    ```shell
    kubectl get pv pvc-d84b4657-7ab5-4212-9270-ce40e6a1356a -o jsonpath='{.spec.csi.volumeAttributes.iscsiEndpoint}'
    ```
    ```output
    iscsi://cluster-loadbalancer-ip:3260/iqn.2016-02.com.smartx:system:54e7022b-2dcc-4b43-800c-e52b6fad07d3/1
    # The IP and port number of iSCSI Portal is the cluster LoadBalancer IP and 3260.
    # The target is `iqn.2016-02.com.smartx:system:54e7022b-2dcc-4b43-800c-e52b6fad07d3`.
    # LUN ID is 1.
    ```
    With the above information, you can use any iSCSI client to access the LUN. For example, if `cluster-loadbalancer-ip` is 192.168.25.101 and the iSCSI client is `open-iscsi`, run the following command:

    ```shell
    iscsiadm -m discovery -t sendtargets  -p 192.168.25.101:3260 --discover
    iscsiadm -m node -T iqn.2016-02.com.smartx:system:54e7022b-2dcc-4b43-800c-e52b6fad07d3 -p 192.168.25.101:3260  --login
    ```

### Delete PVC

To delete a PVC for an iSCSI LUN, ensure that the `iomesh.com/iscsi-lun-iqn-allow-list` field in the PVC has a blank value or is already deleted. Whether the external iSCSI LUN is retained after deleting the PVC depends on the `reclaimPolicy` field in the StorageClass of the PVC.

### External Storage for Multiple Clusters

To utilize external storage from multiple IOMesh clusters, simply configure the YAML file for the desired cluster.

Take the cluster `iomesh-cluster-1` in the namespace `iomesh-cluster-1` as an example. To use storage from the cluster as an external LUN, run the following command to set the `spec.redirector.iscsiVirtualIP` field to the external IP of the `iomesh-access` service. Once the changes are saved, the `iomesh-cluster-1-iscsi-redirector` pod will restart to apply the modification.
```shell
kubectl edit iomesh iomesh-cluster-1 -n iomesh-cluster-1
```
## IOMesh via CSI for External Storage




